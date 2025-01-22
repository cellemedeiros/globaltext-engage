import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deeplApiKey = Deno.env.get('DEEPL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DeepL API language codes mapping
const languageMapping: { [key: string]: string } = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  'pt-br': 'PT-BR',
  'pt-pt': 'PT-PT',
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

    if (!deeplApiKey) {
      console.error('DeepL API key not configured');
      throw new Error('DeepL API key not configured');
    }

    const sourceLang = languageMapping[sourceLanguage.toLowerCase()];
    const targetLang = languageMapping[targetLanguage.toLowerCase()];

    if (!sourceLang || !targetLang) {
      console.error('Unsupported language code:', { sourceLanguage, targetLanguage });
      throw new Error(`Unsupported language code. Supported languages are: ${Object.keys(languageMapping).join(', ')}`);
    }

    console.log('Making DeepL API request...');
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: sourceLang,
        target_lang: targetLang,
        preserve_formatting: true,
        formality: 'default'
      }),
    });

    console.log('DeepL API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      // Handle quota exceeded error specifically
      if (response.status === 456 || errorText.includes('Quota Exceeded')) {
        return new Response(
          JSON.stringify({
            error: 'Translation quota exceeded. Please try again later or contact support.',
            details: 'DeepL API quota limit reached',
            type: 'QuotaExceededError'
          }),
          { 
            status: 429, // Using 429 Too Many Requests for quota issues
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': '3600' // Suggest retry after 1 hour
            }
          }
        );
      }

      throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Translation completed successfully');

    if (!data.translations?.[0]?.text) {
      console.error('Invalid DeepL response format:', data);
      throw new Error('Invalid response format from DeepL API');
    }

    return new Response(
      JSON.stringify({ translation: data.translations[0].text }),
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