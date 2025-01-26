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

    console.log(`Processing webhook event: ${event.type}`, event.data.object);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Processing payment intent:', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        });

        // If this is a translation payment
        if (paymentIntent.metadata?.translationId) {
          const { error: updateError } = await supabaseAdmin
            .from('translations')
            .update({
              payment_status: 'succeeded',
              stripe_payment_intent_id: paymentIntent.id,
              stripe_customer_id: paymentIntent.customer,
            })
            .eq('id', paymentIntent.metadata.translationId);

          if (updateError) {
            console.error('Error updating translation payment status:', updateError);
            throw updateError;
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing completed checkout session:', {
          sessionId: session.id,
          customerId: session.customer,
          metadata: session.metadata,
          userId: session.metadata?.user_id,
        });

        if (!session.metadata?.user_id) {
          throw new Error('No user ID found in session metadata');
        }

        // Get subscription details from Stripe
        const subscriptionId = session.subscription;
        if (!subscriptionId) {
          throw new Error('No subscription ID found in session');
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log('Retrieved subscription details:', subscription);

        // Calculate words based on plan price
        let wordsAllowed = 0;
        const amountPaid = session.amount_total / 100; // Convert from cents to whole currency
        
        if (amountPaid === 1200) { // R$1200
          wordsAllowed = 50000; // Business plan
        } else if (amountPaid === 600) { // R$600
          wordsAllowed = 15000; // Premium plan
        } else {
          wordsAllowed = 5000; // Standard plan
        }

        // Create subscription record in Supabase
        const subscriptionData = {
          user_id: session.metadata.user_id,
          plan_name: amountPaid === 1200 ? 'Business' : amountPaid === 600 ? 'Premium' : 'Standard',
          status: 'active',
          words_remaining: wordsAllowed,
          started_at: new Date().toISOString(),
          expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          amount_paid: amountPaid,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId,
          subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          payment_status: 'succeeded',
          last_payment_date: new Date().toISOString(),
          next_payment_date: new Date(subscription.current_period_end * 1000).toISOString()
        };

        console.log('Creating subscription record:', subscriptionData);

        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .upsert(subscriptionData);

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
          throw subscriptionError;
        }

        // Create notification for user
        const { error: notificationError } = await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: session.metadata.user_id,
            title: 'Subscription Activated',
            message: `Your ${subscriptionData.plan_name} plan subscription has been activated successfully.`
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Processing subscription update:', subscription);

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'inactive',
            subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            next_payment_date: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Processing successful payment:', invoice);

        if (!invoice.subscription) break;

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            payment_status: 'succeeded',
            last_payment_date: new Date().toISOString()
          })
          .eq('stripe_subscription_id', invoice.subscription);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          throw updateError;
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Processing failed payment:', invoice);

        if (!invoice.subscription) break;

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            payment_status: 'failed',
          })
          .eq('stripe_subscription_id', invoice.subscription);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          throw updateError;
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