import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    const { amount, words, plan, documentName, filePath, sourceLanguage, targetLanguage, content, type } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user?.email) {
      throw new Error('Authentication required');
    }

    console.log('Creating checkout session for:', { email: user.email, plan, type });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customer_id = undefined;
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
      
      // For subscriptions, check if already subscribed
      if (type === 'subscription' && plan) {
        const priceId = plan === 'Standard' 
          ? Deno.env.get('STANDARD_PLAN_PRICE')
          : Deno.env.get('PREMIUM_PLAN_PRICE');

        const subscriptions = await stripe.subscriptions.list({
          customer: customer_id,
          status: 'active',
          price: priceId,
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          throw new Error('Already subscribed to this plan');
        }
      }
    }

    // Set up the checkout session configuration
    const sessionConfig: any = {
      customer: customer_id,
      customer_email: customer_id ? undefined : user.email,
      line_items: [{
        quantity: 1,
        price_data: type === 'subscription' && plan
          ? undefined
          : {
              currency: 'usd',
              product_data: {
                name: `Translation Service${words ? ` - ${words} words` : ''}`,
                description: documentName ? `Document: ${documentName}` : undefined,
              },
              unit_amount: Math.round(parseFloat(amount) * 100),
            },
        price: type === 'subscription' && plan
          ? (plan === 'Standard' 
              ? Deno.env.get('STANDARD_PLAN_PRICE') 
              : Deno.env.get('PREMIUM_PLAN_PRICE'))
          : undefined,
      }],
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: `${req.headers.get('origin')}/payment?error=cancelled`,
      metadata: {
        user_id: user.id,
        type,
        plan: plan || undefined,
        words: words?.toString().slice(0, 100),
        documentName: documentName?.slice(0, 100),
        filePath: filePath?.slice(0, 100),
        sourceLanguage: sourceLanguage?.slice(0, 50),
        targetLanguage: targetLanguage?.slice(0, 50),
        contentPreview: content ? `${content.slice(0, 100)}...` : undefined,
      },
    };

    console.log('Creating checkout session with config:', sessionConfig);
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});