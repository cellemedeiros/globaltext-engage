import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts'

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
    const zip = new JSZip();
    await zip.loadAsync(arrayBuffer);
    
    // Get the main document content
    const content = await zip.file("word/document.xml")?.async("string");
    if (!content) {
      throw new Error("Could not read DOCX content");
    }

    // Parse XML and extract text
    const parsed = parse(content);
    const textElements = parsed.getElementsByTagName("w:t");
    const text = Array.from(textElements).map(el => el.textContent).join(" ");
    
    const wordCount = calculateWordCount(text);
    return { text, wordCount };
  } catch (error) {
    console.error('DOCX processing error:', error);
    throw new Error('Failed to process DOCX file');
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
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.type})`);

    let result;
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      result = await processDocx(file);
    } else if (file.type === 'text/plain') {
      result = await processTextFile(file);
    } else {
      // For other file types, attempt to read as text
      try {
        result = await processTextFile(file);
      } catch (error) {
        console.error('File processing error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Unsupported file type or unable to process file',
            message: 'Please upload a DOCX or text file.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
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