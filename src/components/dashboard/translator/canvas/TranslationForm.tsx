import { useState } from "react";
import TranslationHeader from "../TranslationHeader";
import TranslationEditor from "../TranslationEditor";
import TranslationSubmitSection from "../TranslationSubmitSection";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TranslationFormProps {
  translationId?: string;
  initialData?: {
    source_language: string;
    target_language: string;
    content: string;
    ai_translated_content: string;
  };
  onSubmitSuccess?: () => void;
}

const TranslationForm = ({ translationId, initialData, onSubmitSuccess }: TranslationFormProps) => {
  const [sourceLanguage, setSourceLanguage] = useState(initialData?.source_language || "en");
  const [targetLanguage, setTargetLanguage] = useState(initialData?.target_language || "pt");
  const [sourceText, setSourceText] = useState(initialData?.content || "");
  const [targetText, setTargetText] = useState(initialData?.ai_translated_content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSourceTextChange = async (text: string) => {
    setSourceText(text);
    if (text.trim()) {
      setIsTranslating(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const { data, error } = await supabase.functions.invoke('translate-text', {
          body: {
            text,
            sourceLanguage,
            targetLanguage,
          },
        });

        if (error) throw error;
        
        if (data?.translation) {
          setTargetText(data.translation);
        }
      } catch (error) {
        console.error('Translation error:', error);
        toast({
          title: "Translation Error",
          description: "Failed to translate text automatically. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!sourceText.trim() || !targetText.trim()) {
      toast({
        title: "Missing content",
        description: "Please provide both source and target text",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      if (translationId) {
        const { error: updateError } = await supabase
          .from('translations')
          .update({
            content: sourceText,
            ai_translated_content: targetText,
            status: 'pending_admin_review',
          })
          .eq('id', translationId);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Translation updated and submitted for review",
        });

        onSubmitSuccess?.();
        navigate('/translator-dashboard');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit translation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <TranslationHeader
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        onSourceChange={setSourceLanguage}
        onTargetChange={setTargetLanguage}
        isReadOnly={!!translationId}
      />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <TranslationEditor
          sourceText={sourceText}
          targetText={targetText}
          onSourceChange={handleSourceTextChange}
          onTargetChange={setTargetText}
          isTranslating={isTranslating}
          isReadOnly={false}
        />

        <TranslationSubmitSection 
          translationId={translationId}
          isSubmitting={isSubmitting}
          sourceText={sourceText}
          targetText={targetText}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/translator-dashboard')}
        />
      </div>
    </div>
  );
};

export default TranslationForm;