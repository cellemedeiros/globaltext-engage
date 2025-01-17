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
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        
        if (metadata.type === 'translation' && metadata.translationId) {
          console.log(`Processing successful payment for translation ${metadata.translationId}`);
          
          // First verify the translation exists and is in the correct state
          const { data: translation, error: fetchError } = await supabaseAdmin
            .from('translations')
            .select('status, amount_paid')
            .eq('id', metadata.translationId)
            .single();

          if (fetchError) {
            console.error('Error fetching translation:', fetchError);
            throw fetchError;
          }

          if (!translation) {
            throw new Error(`Translation ${metadata.translationId} not found`);
          }

          // Calculate the payment amount in the correct currency unit
          const amountPaid = paymentIntent.amount / 100;
          
          console.log(`Updating translation ${metadata.translationId} to pending status`);
          console.log(`Amount paid: ${amountPaid}`);

          // Update the translation record
          const { error: updateError } = await supabaseAdmin
            .from('translations')
            .update({
              status: 'pending',
              amount_paid: amountPaid,
              price_offered: amountPaid
            })
            .eq('id', metadata.translationId);

          if (updateError) {
            console.error('Error updating translation:', updateError);
            throw updateError;
          }

          // Notify translators about the new available translation
          const { data: translators, error: translatorError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('is_approved_translator', true);

          if (translatorError) {
            console.error('Error fetching translators:', translatorError);
          } else if (translators && translators.length > 0) {
            const notifications = translators.map(translator => ({
              title: 'New Translation Available',
              message: `A new translation project is available${metadata.documentName ? `: ${metadata.documentName}` : ''}`,
              user_id: translator.id,
            }));

            const { error: notificationError } = await supabaseAdmin
              .from('notifications')
              .insert(notifications);

            if (notificationError) {
              console.error('Error creating notifications:', notificationError);
            } else {
              console.log(`Created notifications for ${notifications.length} translators`);
            }
          }

          console.log(`Successfully processed payment and updated translation ${metadata.translationId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        
        if (metadata.type === 'translation' && metadata.translationId) {
          console.log(`Processing failed payment for translation ${metadata.translationId}`);
          
          const { error } = await supabaseAdmin
            .from('translations')
            .update({
              status: 'payment_failed'
            })
            .eq('id', metadata.translationId);

          if (error) {
            console.error('Error updating translation status:', error);
            throw error;
          }

          console.log(`Updated translation ${metadata.translationId} to payment_failed status`);
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