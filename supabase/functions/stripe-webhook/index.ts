import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing Stripe event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};
        
        if (metadata.type === 'translation') {
          const translationId = metadata.translationId;
          console.log('Updating translation status for ID:', translationId);

          // Update translation status to pending (available for translators)
          const { error: updateError } = await supabaseAdmin
            .from('translations')
            .update({
              status: 'pending',
              amount_paid: session.amount_total ? session.amount_total / 100 : 0,
            })
            .eq('id', translationId);

          if (updateError) {
            console.error('Error updating translation:', updateError);
            throw updateError;
          }

          // Create notification for translators
          const { error: notificationError } = await supabaseAdmin
            .from('notifications')
            .insert({
              title: 'New Translation Available',
              message: `A new translation project is available: ${metadata.documentName}`,
              user_id: metadata.userId,
            });

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          }

          console.log('Successfully updated translation and created notification');
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        
        if (metadata.type === 'translation') {
          console.log('Updating failed payment status for translation:', metadata.translationId);
          
          const { error } = await supabaseAdmin
            .from('translations')
            .update({
              status: 'payment_failed',
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
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});