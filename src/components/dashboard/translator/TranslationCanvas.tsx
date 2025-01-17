import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import TranslationHeader from "./TranslationHeader";
import TranslationEditor from "./TranslationEditor";

const TranslationCanvas = () => {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("pt");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
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
      />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <TranslationEditor
          sourceText={sourceText}
          targetText={targetText}
          onSourceChange={handleSourceTextChange}
          onTargetChange={setTargetText}
          isTranslating={isTranslating}
        />
      </div>
    </motion.div>
  );
};

export default TranslationCanvas;