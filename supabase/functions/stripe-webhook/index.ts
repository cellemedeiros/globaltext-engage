import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

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
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};
        
        if (metadata.type === 'subscription') {
          console.log(`Processing successful subscription payment`);
          
          const planName = metadata.plan;
          const userId = metadata.user_id;
          const subscriptionId = session.subscription;
          
          if (!planName || !userId) {
            throw new Error('Missing plan name or user ID in metadata');
          }

          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          
          // Calculate words based on plan
          let wordsAllowed = 0;
          if (planName === 'Standard') {
            wordsAllowed = 10000;
          } else if (planName === 'Premium') {
            wordsAllowed = 25000;
          }

          // Create or update subscription in database
          const { error: subscriptionError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan_name: planName,
              status: 'active',
              words_remaining: wordsAllowed,
              started_at: new Date().toISOString(),
              expires_at: currentPeriodEnd.toISOString(),
              amount_paid: session.amount_total / 100,
            });

          if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError);
            throw subscriptionError;
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.email) {
          throw new Error('Customer email not found');
        }

        // Get user from Supabase
        const { data: userData, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', customer.metadata.user_id)
          .single();

        if (userError) {
          console.error('Error finding user:', userError);
          throw userError;
        }

        // Update subscription status
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', userData.id);

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.email) {
          throw new Error('Customer email not found');
        }

        // Get user from Supabase
        const { data: userData, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', customer.metadata.user_id)
          .single();

        if (userError) {
          console.error('Error finding user:', userError);
          throw userError;
        }

        // Update subscription status to cancelled
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
          })
          .eq('user_id', userData.id);

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }
        break;
      }
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