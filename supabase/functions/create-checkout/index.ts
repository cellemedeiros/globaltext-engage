import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting checkout session creation...');

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    // Get the session or user object
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('No authorization header');
    }

    console.log('Authorization header found, getting user...');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Authentication failed:', userError);
      throw new Error('Authentication failed');
    }

    if (!user.email) {
      console.error('User email not found');
      throw new Error('User email not found');
    }

    console.log('User authenticated successfully');

    const { amount, words, plan } = await req.json();
    
    if (!amount) {
      console.error('Amount is required but not provided');
      throw new Error('Amount is required');
    }

    console.log('Creating Stripe instance...');
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Looking up customer for email:', user.email);
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customer_id = undefined;
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
      console.log('Existing customer found:', customer_id);
    } else {
      console.log('No existing customer found, will create new');
    }

    // Define different configurations based on payment type
    const sessionConfig = plan ? {
      mode: 'subscription',
      line_items: [
        {
          price: getPriceIdForPlan(plan), // You'll need to add your price IDs here
          quantity: 1,
        },
      ],
    } : {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Translation Service - ${words} words`,
            },
            unit_amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
    };

    console.log('Creating checkout session with config:', sessionConfig);
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      customer_email: customer_id ? undefined : user.email,
      ...sessionConfig,
      success_url: `${req.headers.get('origin')}/dashboard`,
      cancel_url: `${req.headers.get('origin')}/payment`,
    });

    console.log('Payment session created successfully:', session.id);
    console.log('Checkout URL:', session.url);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to map plan names to Stripe price IDs
function getPriceIdForPlan(plan: string): string {
  const priceIds = {
    'Standard': 'price_standard_id_here', // Replace with your actual price ID
    'Premium': 'price_premium_id_here',   // Replace with your actual price ID
  };
  return priceIds[plan as keyof typeof priceIds] || '';
}