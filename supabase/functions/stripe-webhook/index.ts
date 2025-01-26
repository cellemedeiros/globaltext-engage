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
        const subscriptionId = session.subscription;
        
        console.log('Processing completed checkout session:', {
          sessionId: session.id,
          customerId,
          customerEmail,
          metadata: session.metadata,
          clientReferenceId: session.client_reference_id,
          subscriptionId,
          invoiceId: session.invoice
        });

        if (!session.client_reference_id) {
          console.error('No client_reference_id found in session');
          throw new Error('No client reference ID found');
        }

        // Get subscription details from Stripe
        const subscription = subscriptionId ? 
          await stripe.subscriptions.retrieve(subscriptionId) : null;

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

        // Get user ID from Supabase based on client_reference_id
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
        console.log('Found user ID:', userId);

        // Update subscription in database
        const subscriptionData = {
          user_id: userId,
          plan_name: planName,
          status: 'active',
          words_remaining: wordsAllowed,
          started_at: new Date().toISOString(),
          expires_at: subscription ? 
            new Date(subscription.current_period_end * 1000).toISOString() :
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount_paid: session.amount_total ? session.amount_total / 100 : 0,
          stripe_session_id: session.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_period_start: subscription ? 
            new Date(subscription.current_period_start * 1000).toISOString() : 
            new Date().toISOString(),
          subscription_period_end: subscription ? 
            new Date(subscription.current_period_end * 1000).toISOString() : 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_status: 'succeeded',
          last_payment_date: new Date().toISOString(),
          next_payment_date: subscription ? 
            new Date(subscription.current_period_end * 1000).toISOString() : 
            null
        };

        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .upsert(subscriptionData);

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }

        console.log('Successfully updated subscription');

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
        }

        console.log('Successfully created notification');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        console.log('Processing subscription update:', {
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status
        });

        // Find the subscription in our database
        const { data: subscriptions, error: fetchError } = await supabaseAdmin
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', subscription.id)
          .limit(1);

        if (fetchError || !subscriptions || subscriptions.length === 0) {
          console.error('Error fetching subscription:', fetchError);
          throw new Error('Subscription not found');
        }

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

        console.log('Successfully updated subscription status');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) {
          console.log('No subscription ID found in invoice');
          break;
        }

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            payment_status: 'succeeded',
            last_payment_date: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          throw updateError;
        }

        console.log('Successfully updated payment status');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) {
          console.log('No subscription ID found in invoice');
          break;
        }

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            payment_status: 'failed',
          })
          .eq('stripe_subscription_id', subscriptionId);

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          throw updateError;
        }

        console.log('Successfully updated payment status to failed');
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