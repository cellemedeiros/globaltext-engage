import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import LanguageSelector from "./LanguageSelector";
import TranslationTextArea from "./TranslationTextArea";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TranslationCanvas = () => {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const translateText = async () => {
      if (!sourceText.trim()) {
        setTranslatedText("");
        setTranslationError(null);
        return;
      }

      setIsTranslating(true);
      setTranslationError(null);
      try {
        const { data, error } = await supabase.functions.invoke('translate-text', {
          body: {
            text: sourceText,
            sourceLanguage,
            targetLanguage,
          },
        });

        if (error) {
          // Parse the error message from the response body if it exists
          let errorMessage = "Failed to translate text. Please try again.";
          try {
            const bodyObj = JSON.parse(error.message);
            if (bodyObj?.error) {
              errorMessage = bodyObj.error;
            }
          } catch {
            // If parsing fails, use the original error message
            errorMessage = error.message;
          }
          throw new Error(errorMessage);
        }
        
        setTranslatedText(data.translation);
        setTranslationError(null);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslationError(error.message);
        toast({
          title: "Translation Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsTranslating(false);
      }
    };

    const debounceTimeout = setTimeout(translateText, 1000);
    return () => clearTimeout(debounceTimeout);
  }, [sourceText, sourceLanguage, targetLanguage, toast]);

  const handleUploadTranslation = async () => {
    try {
      setIsUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const wordCount = sourceText.trim().split(/\s+/).length;

      const { error } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: `Translation_${new Date().toISOString()}`,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          word_count: wordCount,
          amount_paid: 0,
          status: 'completed',
          completed_at: new Date().toISOString(),
          translator_id: session.user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation uploaded successfully!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload translation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {translationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{translationError}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <LanguageSelector
            value={sourceLanguage}
            onChange={setSourceLanguage}
            label="Source"
          />
          <TranslationTextArea
            value={sourceText}
            onChange={setSourceText}
            placeholder="Enter text to translate..."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <LanguageSelector
            value={targetLanguage}
            onChange={setTargetLanguage}
            label="Target"
          />
          <TranslationTextArea
            value={translatedText}
            onChange={setTranslatedText}
            placeholder="Translation will appear here..."
            readOnly={isTranslating}
          />
        </motion.div>
      </div>

      <div className="flex justify-end space-x-4">
        {isTranslating && (
          <div className="flex items-center text-primary">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Translating...
          </div>
        )}
        <Button
          onClick={handleUploadTranslation}
          disabled={isUploading || !translatedText}
          className="bg-primary hover:bg-primary-dark transition-colors duration-300"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Translation'
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default TranslationCanvas;