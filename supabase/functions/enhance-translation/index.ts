import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callOpenAIWithRetry(prompt: string, retries = 3, baseDelay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional translation consultant providing context analysis for translators.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      if (response.status === 429) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Error occurred. Retrying in ${delay}ms...`, error);
      await sleep(delay);
    }
  }
  throw new Error('Max retries reached');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { content, sourceLanguage, targetLanguage } = await req.json()

    if (!content || !sourceLanguage || !targetLanguage) {
      throw new Error('Missing required parameters')
    }

    const prompt = `
      Please analyze this text for translation context:
      
      Text: ${content}
      Source Language: ${sourceLanguage}
      Target Language: ${targetLanguage}
      
      Provide insights about:
      1. Cultural context and nuances
      2. Technical or specialized terminology
      3. Potential translation challenges
      4. Style and tone considerations
    `

    console.log('Sending request to OpenAI')

    const data = await callOpenAIWithRetry(prompt);
    console.log('OpenAI response:', data)

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    return new Response(
      JSON.stringify({
        context: data.choices[0].message.content,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in enhance-translation function:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})