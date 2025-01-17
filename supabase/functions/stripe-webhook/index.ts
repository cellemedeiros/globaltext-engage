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

serve(async (req) => {
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

    console.log(`Processing event type: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        
        if (metadata.type === 'translation' && metadata.translationId) {
          console.log('Processing translation payment for ID:', metadata.translationId);

          // Update translation status to pending (available for translators)
          const { data: translation, error: updateError } = await supabaseAdmin
            .from('translations')
            .update({
              status: 'pending',
              translator_id: null, // Ensure no translator is assigned
              amount_paid: paymentIntent.amount / 100,
              price_offered: paymentIntent.amount / 100
            })
            .eq('id', metadata.translationId)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating translation:', updateError);
            throw updateError;
          }

          console.log('Translation updated successfully:', translation);

          // Get all approved translators
          const { data: translators, error: translatorError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .or('is_approved_translator.eq.true,role.eq.translator');

          if (translatorError) {
            console.error('Error fetching translators:', translatorError);
          } else {
            // Create notifications for all translators
            const notifications = translators.map(translator => ({
              title: 'New Translation Available',
              message: `A new translation project is available: ${metadata.documentName}`,
              user_id: translator.id,
            }));

            if (notifications.length > 0) {
              const { error: notificationError } = await supabaseAdmin
                .from('notifications')
                .insert(notifications);

              if (notificationError) {
                console.error('Error creating notifications:', notificationError);
              } else {
                console.log('Notifications created for translators:', notifications.length);
              }
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        
        if (metadata.type === 'translation' && metadata.translationId) {
          console.log('Updating failed payment status for translation:', metadata.translationId);
          
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
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});