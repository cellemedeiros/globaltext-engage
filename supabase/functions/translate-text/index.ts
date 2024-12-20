import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deeplApiKey = Deno.env.get('DEEPL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DeepL language code mapping
const languageMapping: { [key: string]: string } = {
  en: 'EN-US',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  pt: 'PT-PT',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();

    if (!text || !sourceLanguage || !targetLanguage) {
      throw new Error('Missing required parameters');
    }

    if (!deeplApiKey) {
      throw new Error('DeepL API key not configured');
    }

    console.log(`Translating from ${sourceLanguage} to ${targetLanguage}`);
    
    const deeplSourceLang = languageMapping[sourceLanguage] || sourceLanguage.toUpperCase();
    const deeplTargetLang = languageMapping[targetLanguage] || targetLanguage.toUpperCase();

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: deeplSourceLang,
        target_lang: deeplTargetLang,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepL API error:', error);
      throw new Error(`DeepL API error: ${error}`);
    }

    const data = await response.json();
    console.log('DeepL response received');

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