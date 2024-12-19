import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

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
    const { text, sourceLanguage, targetLanguage } = await req.json();
    console.log('Received translation request:', { sourceLanguage, targetLanguage });

    if (!text || !sourceLanguage || !targetLanguage) {
      throw new Error('Missing required parameters');
    }

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
                   Provide only the translated text without any additional comments or explanations.
                   Maintain the original formatting and structure.
                   Here is the text to translate: "${text}"`;

    console.log('Making request to Gemini API...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response format:', data);
      throw new Error('Invalid Gemini response format');
    }

    const translation = data.candidates[0].content.parts[0].text.trim();
    console.log('Translation completed successfully');

    return new Response(
      JSON.stringify({ translation }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Translation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during translation' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});