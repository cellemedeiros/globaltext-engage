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

  // For admin users, create a business subscription if they don't have one
  if (isAdmin) {
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!existingSubscription) {
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: session.user.id,
          plan_name: 'business',
          status: 'active',
          words_remaining: 999999999, // Effectively unlimited
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          amount_paid: 0
        });

      if (subscriptionError) throw subscriptionError;
    }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single();

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
      payment_status: isAdmin ? 'completed' : 'pending',
      subscription_id: subscription?.id
    });

  if (error) throw error;
  
  return { isAdmin, calculatedPrice };
};