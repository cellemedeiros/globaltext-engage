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
    console.log('Starting translation request...');
    
    const { text, sourceLanguage, targetLanguage } = await req.json();
    console.log('Request parameters:', { sourceLanguage, targetLanguage, textLength: text?.length });

    if (!text || !sourceLanguage || !targetLanguage) {
      console.error('Missing required parameters:', { hasText: !!text, sourceLanguage, targetLanguage });
      throw new Error('Missing required parameters: text, sourceLanguage, or targetLanguage');
    }

    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      throw new Error('Gemini API key not configured');
    }

    console.log('Making Gemini API request...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only return the translated text, nothing else: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
        },
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'Translation quota exceeded. Please try again later.',
            details: 'Rate limit reached',
            type: 'QuotaExceededError'
          }),
          { 
            status: 429,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': '60'
            }
          }
        );
      }

      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Translation completed successfully');

    const translatedText = data.candidates[0].content.parts[0].text;
    if (!translatedText) {
      console.error('Invalid Gemini response format:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    return new Response(
      JSON.stringify({ translation: translatedText }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Translation error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
        type: error.name
      }),
      { 
        status: error.name === 'QuotaExceededError' ? 429 : 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});