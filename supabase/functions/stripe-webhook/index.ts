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
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const customerEmail = session.customer_details?.email;
        
        console.log('Processing completed checkout session:', {
          sessionId: session.id,
          customerId,
          customerEmail,
          metadata: session.metadata
        });

        // Get user ID from Supabase based on email
        const { data: users, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', session.client_reference_id)
          .limit(1);

        if (userError || !users || users.length === 0) {
          console.error('Error fetching user:', userError);
          throw new Error('User not found');
        }

        const userId = users[0].id;

        // Calculate words based on plan
        let wordsAllowed = 0;
        const planName = session.metadata?.plan || 'Standard';
        if (planName === 'Standard') {
          wordsAllowed = 5000;
        } else if (planName === 'Premium') {
          wordsAllowed = 15000;
        } else if (planName === 'Business') {
          wordsAllowed = 50000;
        }

        // Set expiration date to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        console.log('Updating subscription in database:', {
          userId,
          planName,
          wordsAllowed,
          expiresAt,
          sessionId: session.id
        });

        // Update subscription in database
        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_name: planName,
            status: 'active',
            words_remaining: wordsAllowed,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            amount_paid: session.amount_total ? session.amount_total / 100 : 0,
            stripe_session_id: session.id,
            stripe_customer_id: customerId
          });

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }

        // Create notification for user
        const { error: notificationError } = await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Subscription Activated',
            message: `Your ${planName} plan subscription has been activated successfully.`
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Don't throw here, as the subscription was already created
        }

        console.log('Successfully updated subscription and created notification');
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