import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deeplApiKey = Deno.env.get('DEEPL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DeepL language code mapping
const languageMapping: { [key: string]: string } = {
  en: 'EN',    // DeepL uses just 'EN'
  es: 'ES',    // Spanish
  fr: 'FR',    // French
  de: 'DE',    // German
  it: 'IT',    // Italian
  pt: 'PT',    // Portuguese
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    console.log(`Received request to translate from ${sourceLanguage} to ${targetLanguage}`);

    if (!text || !sourceLanguage || !targetLanguage) {
      throw new Error('Missing required parameters');
    }

    if (!deeplApiKey) {
      console.error('DeepL API key not configured');
      throw new Error('DeepL API key not configured');
    }

    // Map the language codes to DeepL format and normalize to uppercase
    const sourceLang = (languageMapping[sourceLanguage.toLowerCase()] || sourceLanguage.toUpperCase());
    const targetLang = (languageMapping[targetLanguage.toLowerCase()] || targetLanguage.toUpperCase());

    console.log(`Using DeepL language codes: ${sourceLang} -> ${targetLang}`);

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
        preserve_formatting: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API error response:', errorText);
      throw new Error(`DeepL API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepL response received successfully');

    if (!data.translations?.[0]?.text) {
      console.error('Invalid DeepL response format:', data);
      throw new Error('Invalid DeepL response format');
    }

    const translation = data.translations[0].text;
    console.log('Translation completed successfully');

    return new Response(
      JSON.stringify({ translation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});