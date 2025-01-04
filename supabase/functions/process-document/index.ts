import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as zip from "https://deno.land/x/zipjs/index.js";

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
    const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(arrayBuffer)));
    const entries = await reader.getEntries();
    
    // Find the document.xml file
    const documentXml = entries.find(entry => entry.filename === "word/document.xml");
    if (!documentXml) {
      throw new Error("Could not find document.xml in DOCX file");
    }

    // Get the XML content
    const xmlContent = await documentXml.getData(new zip.TextWriter());
    
    // Extract text from XML (simple approach - can be improved)
    const textContent = xmlContent
      .replace(/<[^>]+>/g, ' ') // Remove XML tags
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();

    const wordCount = calculateWordCount(textContent);
    return { text: textContent, wordCount };
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
    console.log('Processing document request received');
    
    // Get and validate content type
    const contentType = req.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid content type',
          message: 'Content type must be multipart/form-data'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

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
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      result = await processDocx(file);
    } else if (file.type === 'text/plain') {
      result = await processTextFile(file);
    } else {
      console.error(`Unsupported file type: ${file.type}`);
      return new Response(
        JSON.stringify({ 
          error: 'Unsupported file type',
          message: 'Please upload a DOCX or text file.'
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
        message: 'Unable to process the file. Please try a different format or contact support.',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})