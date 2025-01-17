import { supabase } from "@/integrations/supabase/client";
import { calculatePrice } from "@/utils/documentUtils";

interface TranslationCreatorProps {
  file: File;
  wordCount: number;
  sourceLanguage: string;
  targetLanguage: string;
  extractedText: string;
  filePath: string;
}

export const createTranslationRecord = async ({
  file,
  wordCount,
  sourceLanguage,
  targetLanguage,
  extractedText,
  filePath,
}: TranslationCreatorProps) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No active session');

  const isAdmin = session.user.email === 'bispomathews@gmail.com';
  const calculatedPrice = calculatePrice(wordCount);

  const { error } = await supabase
    .from('translations')
    .insert({
      user_id: session.user.id,
      document_name: file.name,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      word_count: wordCount,
      status: 'pending',
      amount_paid: isAdmin ? calculatedPrice : 0,
      price_offered: calculatedPrice,
      file_path: filePath,
      content: extractedText,
      payment_status: isAdmin ? 'completed' : 'pending'
    });

  if (error) throw error;
  
  return { isAdmin, calculatedPrice };
};