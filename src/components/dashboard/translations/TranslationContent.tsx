import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Globe } from "lucide-react";
import TranslationDownload from "./TranslationDownload";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TranslationContentProps {
  content?: string;
  aiTranslatedContent?: string;
  title: string;
  filePath?: string;
  translatedFilePath?: string;
  documentName: string;
  role?: 'client' | 'translator' | 'admin';
  sourceLanguage?: string;
  targetLanguage?: string;
}

const TranslationContent = ({ 
  content, 
  aiTranslatedContent, 
  title,
  filePath,
  translatedFilePath,
  documentName,
  role = 'client',
  sourceLanguage,
  targetLanguage
}: TranslationContentProps) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [automaticTranslation, setAutomaticTranslation] = useState<string>("");
  const { toast } = useToast();

  const handleGetTranslation = async () => {
    if (!content || !sourceLanguage || !targetLanguage) return;
    
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text: content,
          sourceLanguage,
          targetLanguage
        }
      });

      if (error) {
        if (error.message?.includes('quota exceeded') || error.message?.includes('429')) {
          toast({
            title: "Translation Limit Reached",
            description: "The translation service is currently unavailable due to high demand. Please try again later.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Translation Error",
            description: "Failed to generate automatic translation. Please try again.",
            variant: "destructive"
          });
        }
        throw error;
      }

      if (data?.translation) {
        setAutomaticTranslation(data.translation);
        toast({
          title: "Translation Generated",
          description: "Automatic translation has been generated successfully.",
        });
      }
    } catch (error) {
      console.error('Error getting automatic translation:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (aiTranslatedContent) {
      setAutomaticTranslation(aiTranslatedContent);
    }
  }, [aiTranslatedContent]);

  if (!content && !aiTranslatedContent && !translatedFilePath) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {!automaticTranslation && !isTranslating && content && (
            <Button
              onClick={handleGetTranslation}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Get Automatic Translation
            </Button>
          )}
          {isTranslating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating automatic translation...
            </div>
          )}
        </div>
        <div className="flex gap-4">
          {role !== 'client' && filePath && (
            <TranslationDownload 
              filePath={filePath}
              documentName={documentName}
              variant="original"
            />
          )}
          {translatedFilePath && (
            <TranslationDownload 
              filePath={translatedFilePath}
              documentName={documentName}
              variant="translation"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {content && (
          <Card className="p-4 col-span-1">
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">Original Content</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              </div>
            </ScrollArea>
          </Card>
        )}
        
        {(automaticTranslation || isTranslating) && (
          <Card className="p-4 col-span-1">
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">Automatic Translation</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {isTranslating ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{automaticTranslation}</p>
                )}
              </div>
            </ScrollArea>
          </Card>
        )}
        
        {aiTranslatedContent && (
          <Card className="p-4 col-span-1">
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">AI Translation</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap">{aiTranslatedContent}</p>
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TranslationContent;