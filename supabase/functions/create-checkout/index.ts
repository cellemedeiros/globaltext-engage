import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid token');
    }

    // Parse request body
    const requestText = await req.text();
    if (!requestText) {
      throw new Error('Request body is empty');
    }

    console.log('Request body:', requestText);
    
    const { amount, words, documentName, type = 'translation', filePath, content, sourceLanguage, targetLanguage } = JSON.parse(requestText);
    
    console.log('Parsed request:', { amount, words, documentName, type });

    // Validate required fields
    if (!amount || !words || !documentName) {
      throw new Error('Missing required fields');
    }

    // Get the origin URL from the request headers
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    console.log('Origin URL:', origin);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      payment_intent_data: {
        metadata: {
          type: 'translation',
          userId: user.id,
          wordCount: words,
          documentName,
          filePath,
          content,
          sourceLanguage,
          targetLanguage,
          email: user.email
        },
      },
      customer_email: user.email,
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

    console.log('Checkout session created:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create checkout session' }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});