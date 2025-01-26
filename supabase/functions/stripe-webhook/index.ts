import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return new Response('Missing signature or webhook secret', { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const metadata = subscription.metadata || {};
        const userId = metadata.user_id || subscription.customer.metadata?.user_id;
        
        if (!userId) {
          throw new Error('No user ID found in metadata');
        }

        // Calculate words based on plan
        let wordsAllowed = 0;
        const planName = metadata.plan;
        if (planName === 'Standard') {
          wordsAllowed = 10000;
        } else if (planName === 'Premium') {
          wordsAllowed = 15000;
        } else if (planName === 'Business') {
          wordsAllowed = 50000;
        }

        console.log('Updating subscription in database:', {
          userId,
          planName,
          status: subscription.status,
          wordsAllowed
        });

        // Update subscription in database
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: userId,
            plan_name: planName,
            status: subscription.status,
            words_remaining: wordsAllowed,
            started_at: new Date(subscription.current_period_start * 1000).toISOString(),
            expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            amount_paid: subscription.plan.amount / 100,
          });

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }

        console.log('Successfully updated subscription in database');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id || subscription.customer.metadata?.user_id;

        if (!userId) {
          throw new Error('No user ID found in metadata');
        }

        console.log('Cancelling subscription in database:', { userId });

        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscription.id);

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }

        console.log('Successfully cancelled subscription in database');
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});