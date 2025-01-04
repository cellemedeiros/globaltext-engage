import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as zip from "https://deno.land/x/zipjs/index.js";
import * as mammoth from "https://esm.sh/mammoth@1.6.0";

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

async function processDocx(file: File): Promise<{ text: string; wordCount: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Process .docx file using mammoth
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      const wordCount = calculateWordCount(text);
      return { text, wordCount };
    } else {
      // Process .doc file (older format)
      // For .doc files, we'll extract text in a simpler way
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(arrayBuffer);
      const wordCount = calculateWordCount(text);
      return { text, wordCount };
    }
  } catch (error) {
    console.error('Document processing error:', error);
    throw new Error('Failed to process document file');
  }
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
    console.log('Processing document request received');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file uploaded');
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.type})`);

    let result;
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword') {
      result = await processDocx(file);
    } else if (file.type === 'text/plain') {
      result = await processTextFile(file);
    } else {
      console.error(`Unsupported file type: ${file.type}`);
      return new Response(
        JSON.stringify({ 
          error: 'Unsupported file type',
          message: 'Please upload a .txt, .doc, or .docx file.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Successfully processed ${file.name}. Word count: ${result.wordCount}`);
    
    return new Response(
      JSON.stringify({
        wordCount: result.wordCount,
        text: result.text,
        message: 'File processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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