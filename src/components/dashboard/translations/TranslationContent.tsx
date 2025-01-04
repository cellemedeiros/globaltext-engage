import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranslationContentProps {
  content?: string;
  aiTranslatedContent?: string;
  title: string;
}

const TranslationContent = ({ content, aiTranslatedContent, title }: TranslationContentProps) => {
  if (!content && !aiTranslatedContent) return null;

  return (
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
  );
};

export default TranslationContent;