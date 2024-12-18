import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "./LanguageSelector";
import TranslationTextArea from "./TranslationTextArea";

const TranslationCanvas = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to translate",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: sourceText,
          sourceLanguage,
          targetLanguage,
        }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const data = await response.json();
      setTranslatedText(data.translation);

      toast({
        title: "Success",
        description: "Translation completed",
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleUploadTranslation = async () => {
    if (!translatedText.trim()) {
      toast({
        title: "Error",
        description: "Please complete the translation before uploading",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Calculate word count (simple implementation)
      const wordCount = sourceText.trim().split(/\s+/).length;

      const { error } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: `Translation_${new Date().toISOString()}`,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          word_count: wordCount,
          amount_paid: 0, // Set appropriate amount based on your business logic
          status: 'completed',
          completed_at: new Date().toISOString(),
          translator_id: session.user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload translation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-translate when source text changes
  const handleSourceTextChange = (text: string) => {
    setSourceText(text);
    if (text.trim()) {
      handleTranslate();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Translation Canvas</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <Tabs defaultValue="source">
            <TabsList className="w-full">
              <TabsTrigger value="source" className="flex-1">Source Text</TabsTrigger>
            </TabsList>
            <TabsContent value="source">
              <LanguageSelector
                value={sourceLanguage}
                onChange={setSourceLanguage}
                label="source"
              />
              <TranslationTextArea
                value={sourceText}
                onChange={handleSourceTextChange}
                placeholder="Enter text to translate..."
              />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-4">
          <Tabs defaultValue="translation">
            <TabsList className="w-full">
              <TabsTrigger value="translation" className="flex-1">Translation</TabsTrigger>
            </TabsList>
            <TabsContent value="translation">
              <LanguageSelector
                value={targetLanguage}
                onChange={setTargetLanguage}
                label="target"
              />
              <TranslationTextArea
                value={translatedText}
                onChange={setTranslatedText}
                placeholder="Translation will appear here..."
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button 
          onClick={handleTranslate} 
          disabled={isTranslating}
        >
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
        <Button 
          onClick={handleUploadTranslation}
          variant="default"
        >
          Upload Translation
        </Button>
      </div>
    </div>
  );
};

export default TranslationCanvas;