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

    console.log(`Event type: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        
        if (metadata.type === 'translation') {
          console.log('Processing translation payment:', metadata);

          // Create the translation record
          const { error: translationError } = await supabaseAdmin
            .from('translations')
            .insert({
              user_id: metadata.userId,
              document_name: metadata.documentName,
              source_language: metadata.sourceLanguage || 'en',
              target_language: metadata.targetLanguage || 'pt',
              word_count: parseInt(metadata.wordCount),
              status: 'pending',
              amount_paid: paymentIntent.amount / 100,
              price_offered: paymentIntent.amount / 100,
              content: metadata.content,
              file_path: metadata.filePath
            });

          if (translationError) {
            console.error('Error creating translation:', translationError);
            throw translationError;
          }

          // Get all approved translators
          const { data: translators, error: translatorError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('role', 'translator')
            .eq('is_approved_translator', true);

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
              }
            }
          }

          // Create notification for the client
          const { error: clientNotificationError } = await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: metadata.userId,
              title: 'Translation Order Confirmed',
              message: `Your translation order for ${metadata.documentName} has been confirmed and is now available for translators.`,
            });

          if (clientNotificationError) {
            console.error('Error creating client notification:', clientNotificationError);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        
        if (metadata.type === 'translation') {
          console.log('Payment failed for translation:', metadata);
          
          const { error: notificationError } = await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: metadata.userId,
              title: 'Payment Failed',
              message: `Payment failed for translation: ${metadata.documentName}. Please try again.`,
            });

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
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