import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calculateWordCount(text: string): number {
  // Remove special characters and extra whitespace
  const cleanText = text
    .replace(/[\r\n]+/g, " ") // Replace multiple newlines with space
    .replace(/[^\w\s]/g, " ") // Replace special characters with space
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();

  // Split by whitespace and filter out empty strings
  const words = cleanText.split(" ").filter(word => word.length > 0);
  return words.length;
}

async function processTextFile(file: File): Promise<{ text: string; wordCount: number }> {
  try {
    const text = await file.text();
    const wordCount = calculateWordCount(text);
    return { text, wordCount };
  } catch (error) {
    console.error('Text processing error:', error);
    throw new Error('Failed to process text file');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.type})`);

    // For now, we'll only handle text files
    if (file.type === 'text/plain') {
      const result = await processTextFile(file);
      
      console.log(`Successfully processed ${file.name}. Word count: ${result.wordCount}`);
      
      return new Response(
        JSON.stringify({
          wordCount: result.wordCount,
          text: result.text,
          message: 'File processed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // For other file types, attempt to read as text
      try {
        const result = await processTextFile(file);
        return new Response(
          JSON.stringify({
            wordCount: result.wordCount,
            text: result.text,
            message: 'File processed successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('File processing error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Unsupported file type or unable to process file',
            message: 'Please upload a text file for now. PDF support coming soon.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Processing error',
        message: 'Unable to process the file. Please try a different format or contact support.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})