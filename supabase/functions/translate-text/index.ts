import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deeplApiKey = Deno.env.get('DEEPL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DeepL language code mapping
const languageMapping: { [key: string]: string } = {
  en: 'EN',    // English
  es: 'ES',    // Spanish
  fr: 'FR',    // French
  de: 'DE',    // German
  it: 'IT',    // Italian
  pt: 'PT-PT', // Portuguese (European)
  'pt-br': 'PT-BR', // Portuguese (Brazilian)
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the API key presence (not the actual key)
    console.log('DeepL API Key present:', !!deeplApiKey);

    const { text, sourceLanguage, targetLanguage } = await req.json();
    console.log('Translation request received:', {
      sourceLanguage,
      targetLanguage,
      textLength: text?.length || 0
    });

    if (!text || !sourceLanguage || !targetLanguage) {
      console.error('Missing required parameters:', { 
        hasText: !!text, 
        sourceLanguage, 
        targetLanguage 
      });
      throw new Error('Missing required parameters: text, sourceLanguage, or targetLanguage');
    }

    if (!deeplApiKey) {
      console.error('DeepL API key not configured');
      throw new Error('DeepL API key not configured');
    }

    // Map the language codes to DeepL format
    const sourceLang = (languageMapping[sourceLanguage.toLowerCase()] || sourceLanguage.toUpperCase());
    const targetLang = (languageMapping[targetLanguage.toLowerCase()] || targetLanguage.toUpperCase());

    console.log(`Making DeepL API request with languages: ${sourceLang} -> ${targetLang}`);

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

    // Log the raw response status
    console.log('DeepL API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.translations?.[0]?.text) {
      console.error('Invalid DeepL response format:', data);
      throw new Error('Invalid response format from DeepL API');
    }

    const translation = data.translations[0].text;
    console.log('Translation completed successfully');

    return new Response(
      JSON.stringify({ translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});