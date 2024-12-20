import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import LanguagePairs from "./LanguagePairs";
import TranslationEditor from "./TranslationEditor";
import { useQuery } from "@tanstack/react-query";
import AdminReviewPanel from "./AdminReviewPanel";

const TranslationCanvas = () => {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("pt");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const handleSourceTextChange = async (text: string) => {
    setSourceText(text);
    if (text.trim()) {
      setIsTranslating(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const response = await fetch('/functions/v1/translate-text', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            sourceLanguage,
            targetLanguage,
          }),
        });

        if (!response.ok) throw new Error('Translation failed');

        const { translation } = await response.json();
        setTargetText(translation);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first",
        variant: "destructive"
      });
      return;
    }

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
          status: 'pending_review',
          word_count: sourceText.split(/\s+/).length,
          amount_paid: 0,
          translator_id: session.user.id
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Translation submitted successfully",
      });

      // Reset form
      setSelectedFile(null);
      setSourceText("");
      setTargetText("");
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to submit translation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = profile?.id === "37665cdd-1fdd-40d0-b485-35148c159bed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-6">
        <LanguagePairs
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceChange={setSourceLanguage}
          onTargetChange={setTargetLanguage}
        />

        <TranslationEditor
          sourceText={sourceText}
          targetText={targetText}
          onSourceChange={handleSourceTextChange}
          onTargetChange={setTargetText}
          isTranslating={isTranslating}
        />

        <div className="space-y-4">
          <Button asChild className="w-full">
            <label className="cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              {selectedFile ? selectedFile.name : "Upload Translation (PDF)"}
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileSelect}
              />
            </label>
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || !sourceText.trim() || !targetText.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Translation'
            )}
          </Button>
        </div>

        {isAdmin && <AdminReviewPanel />}
      </div>
    </motion.div>
  );
};

export default TranslationCanvas;