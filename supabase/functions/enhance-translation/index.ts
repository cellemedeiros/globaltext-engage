import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, sourceLanguage, targetLanguage } = await req.json()

    const prompt = `As a professional translator, analyze the following text that needs to be translated from ${sourceLanguage} to ${targetLanguage}. Provide insights about:
    1. The text's tone and style
    2. Any cultural considerations
    3. Technical terminology or jargon that requires special attention
    4. Potential translation challenges
    
    Text to analyze:
    ${content}
    
    Format your response to be clear and concise, focusing on the most important aspects for translation.`

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
      }),
    })

    const data = await response.json()
    const analysis = data.choices[0].message.content

    return new Response(
      JSON.stringify({ context: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})