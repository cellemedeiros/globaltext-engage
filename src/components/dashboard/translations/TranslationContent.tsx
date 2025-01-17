import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb } from "lucide-react";
import TranslationDownload from "./TranslationDownload";
import { useState } from "react";
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
  const [contextAnalysis, setContextAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const getContextAnalysis = async () => {
    if (!content || !sourceLanguage || !targetLanguage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-translation', {
        body: {
          content,
          sourceLanguage,
          targetLanguage
        }
      });

      if (error) throw error;

      setContextAnalysis(data.context);
      toast({
        title: "Analysis Complete",
        description: "Context analysis has been generated successfully.",
      });
    } catch (error) {
      console.error('Error getting context analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate context analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!content && !aiTranslatedContent && !translatedFilePath) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {role === 'translator' && content && (
            <Button
              onClick={getContextAnalysis}
              variant="outline"
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Get Context Analysis"}
            </Button>
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

      {contextAnalysis && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">Context Analysis</h4>
          <p className="text-sm">{contextAnalysis}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        {content && (
          <Card className="p-4">
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">Original Content</h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              </div>
            </ScrollArea>
          </Card>
        )}
        
        {aiTranslatedContent && (
          <Card className="p-4">
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">AI Translation</h4>
            <ScrollArea className="h-[200px]">
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