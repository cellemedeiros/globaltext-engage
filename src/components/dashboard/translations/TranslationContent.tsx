import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationDownload from "./TranslationDownload";

interface TranslationContentProps {
  content?: string;
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
  title,
  filePath,
  translatedFilePath,
  documentName,
  role = 'client',
}: TranslationContentProps) => {
  if (!content && !translatedFilePath) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {role === 'translator' && content && (
            <div className="text-sm text-muted-foreground">
              Original document content is available below
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

      <div className="grid grid-cols-1 gap-6">
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
      </div>
    </div>
  );
};

export default TranslationContent;