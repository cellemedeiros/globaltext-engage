import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TranslationHeader from "./TranslationHeader";
import TranslationEditor from "./TranslationEditor";
import TranslationActions from "./TranslationActions";
import AdminReviewPanel from "./AdminReviewPanel";
import { useNavigate } from "react-router-dom";

interface TranslationCanvasProps {
  translationId?: string;
}

const TranslationCanvas = ({ translationId }: TranslationCanvasProps) => {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("pt");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch translation data if translationId is provided
  const { data: translation } = useQuery({
    queryKey: ['translation', translationId],
    queryFn: async () => {
      if (!translationId) return null;
      
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('id', translationId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!translationId
  });

  // Update state when translation data is loaded
  useEffect(() => {
    if (translation) {
      setSourceLanguage(translation.source_language);
      setTargetLanguage(translation.target_language);
      setSourceText(translation.content || '');
      setTargetText(translation.ai_translated_content || '');
    }
  }, [translation]);

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
        // Update existing translation
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

        // Navigate back to the dashboard
        navigate('/translator-dashboard');
      } else {
        // Create new translation
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('translations')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: selectedFile.name,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          content: sourceText,
          ai_translated_content: targetText,
          status: 'pending_admin_review',
          word_count: sourceText.split(/\s+/).length,
          amount_paid: 0,
          translator_id: session.user.id,
          admin_review_status: 'pending'
        });
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 bg-gray-50 p-6 rounded-lg"
    >
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

        <div className="mt-6 flex justify-end gap-4">
          {translationId && (
            <Button
              variant="outline"
              onClick={() => navigate('/translator-dashboard')}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !sourceText.trim() || !targetText.trim()}
          >
            {isSubmitting ? "Submitting..." : translationId ? "Update Translation" : "Submit Translation"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TranslationCanvas;
