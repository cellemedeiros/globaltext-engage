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
    const { amount, words, plan, documentName, type, sourceLanguage, targetLanguage, content, filePath } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let session;

    if (type === 'translation') {
      // Create payment intent for individual translation
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: 'brl',
        metadata: {
          type: 'translation',
          userId: user.id,
          wordCount: words,
          documentName,
          sourceLanguage,
          targetLanguage,
          content,
          filePath
        },
      });

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/dashboard?success=true`,
        cancel_url: `${req.headers.get('origin')}/dashboard?canceled=true`,
        payment_intent_data: {
          metadata: {
            type: 'translation',
            userId: user.id,
            wordCount: words,
            documentName,
            sourceLanguage,
            targetLanguage,
            content,
            filePath
          },
        },
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: `Translation: ${documentName}`,
                description: `${words} words`,
              },
              unit_amount: Math.round(parseFloat(amount) * 100),
            },
            quantity: 1,
          },
        ],
      });
    } else if (type === 'subscription') {
      // Handle subscription checkout
      const subscription = await stripe.subscriptions.create({
        customer: user.id,
        items: [{ price: plan }],
        expand: ['latest_invoice.payment_intent'],
      });

      session = {
        url: subscription.latest_invoice.payment_intent?.next_action?.redirect_to_url?.url,
      };
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
