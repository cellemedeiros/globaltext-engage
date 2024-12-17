import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { translationId } = await req.json();
    console.log(`Processing translation ID: ${translationId}`);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Get translation details
    const { data: translation, error: translationError } = await supabase
      .from('translations')
      .select('*')
      .eq('id', translationId)
      .single();

    if (translationError) {
      console.error('Error fetching translation:', translationError);
      throw translationError;
    }

    console.log('Translation details:', translation);

    // Call OpenAI API for translation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text from ${translation.source_language} to ${translation.target_language}. Maintain the original formatting and structure.`
          },
          {
            role: 'user',
            content: translation.content
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    console.log('AI Response received');
    
    if (!aiResponse.choices?.[0]?.message?.content) {
      console.error('Invalid AI response:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    const translatedText = aiResponse.choices[0].message.content;

    // Update translation with AI result
    const { error: updateError } = await supabase
      .from('translations')
      .update({ 
        ai_translated_content: translatedText,
        status: 'pending_review',
        ai_translated_at: new Date().toISOString()
      })
      .eq('id', translationId);

    if (updateError) {
      console.error('Error updating translation:', updateError);
      throw updateError;
    }

    console.log('Translation completed and saved successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});