import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, plan, user_id, email, documentName, filePath, sourceLanguage, targetLanguage, content } = await req.json();

    console.log('Creating checkout session with params:', { amount, plan, email });

    // Get or create customer
    let customer;
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { user_id }
      });
    }

    // Create product for this subscription
    const product = await stripe.products.create({
      name: `${plan || 'Translation'} Plan`,
      description: `Translation service subscription - ${plan || 'Standard'} plan`,
    });

    // Create price for the subscription
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(parseFloat(amount) * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    console.log('Created price:', price.id);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: `${req.headers.get('origin')}/payment?error=cancelled`,
      metadata: {
        user_id,
        type: 'subscription',
        plan,
        documentName,
        filePath,
        sourceLanguage,
        targetLanguage,
        content,
      },
    });

    console.log('Created checkout session:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});