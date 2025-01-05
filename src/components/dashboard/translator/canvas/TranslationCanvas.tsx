import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import TranslationEditor from "../TranslationEditor";
import TranslationHeader from "../TranslationHeader";
import TranslationSubmitSection from "../TranslationSubmitSection";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const TranslationCanvas = () => {
  const { translationId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const { data: translation, isLoading } = useQuery({
    queryKey: ['translation', translationId],
    queryFn: async () => {
      if (!translationId) return null;
      
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('id', translationId)
        .single();
      
      if (error) throw error;
      
      // Update local state with translation data
      setSourceText(data.content || '');
      setTargetText(data.ai_translated_content || '');
      
      return data;
    },
    enabled: !!translationId
  });

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
            sourceLanguage: translation?.source_language,
            targetLanguage: translation?.target_language,
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

      navigate('/translator-dashboard');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!translation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <p className="text-center text-gray-500">Translation not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <TranslationHeader
            sourceLanguage={translation.source_language}
            targetLanguage={translation.target_language}
            onSourceChange={() => {}}
            onTargetChange={() => {}}
            isReadOnly={true}
          />

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
    </div>
  );
};

export default TranslationCanvas;