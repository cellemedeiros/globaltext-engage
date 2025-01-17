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
        
        if (metadata.type === 'translation') {
          console.log(`Processing successful payment for translation`);
          
          // Create or update the translation record
          const { error: translationError } = await supabaseAdmin
            .from('translations')
            .insert({
              user_id: metadata.userId,
              document_name: metadata.documentName,
              word_count: parseInt(metadata.words),
              status: 'pending',
              payment_status: 'completed',
              stripe_payment_intent_id: session.payment_intent,
              stripe_customer_id: session.customer,
              amount_paid: session.amount_total / 100,
              price_offered: session.amount_total / 100
            });

          if (translationError) {
            console.error('Error creating translation:', translationError);
            throw translationError;
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
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const metadata = session.metadata || {};
        
        if (metadata.type === 'translation') {
          console.log(`Processing expired payment for translation`);
          
          const { error } = await supabaseAdmin
            .from('translations')
            .update({
              payment_status: 'expired'
            })
            .eq('stripe_payment_intent_id', session.payment_intent);

          if (error) {
            console.error('Error updating translation payment status:', error);
            throw error;
          }
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