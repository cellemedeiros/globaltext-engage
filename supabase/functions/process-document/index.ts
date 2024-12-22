import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { extract } from 'https://deno.land/x/textractor@0.0.7/mod.ts';

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

    // Check file type
    const fileType = file.type;
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(fileType)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid file type',
          message: 'Please upload a .txt, .doc, .docx, .pdf, .xls, .xlsx, .ppt, or .pptx file'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract text content from the file
    let text;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const extractResult = await extract(new Uint8Array(arrayBuffer), {
        preserveLineBreaks: true,
        preserveOnlyMultipleLineBreaks: true,
      });
      text = extractResult.text;
    } catch (error) {
      console.error('Text extraction error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Processing error',
          message: 'Unable to process the file. Please try a different format or contact support.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Calculate word count
    const wordCount = calculateWordCount(text);

    return new Response(
      JSON.stringify({ 
        wordCount,
        text,
        message: 'File processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again or contact support.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})