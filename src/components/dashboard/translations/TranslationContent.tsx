interface TranslationContentProps {
  content?: string;
  aiTranslatedContent?: string;
  title: string;
}

const TranslationContent = ({ content, aiTranslatedContent, title }: TranslationContentProps) => {
  if (!content && !aiTranslatedContent) return null;

  return (
    <div className="space-y-4">
      {content && (
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Original Content</h4>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      )}
      
      {aiTranslatedContent && (
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">AI Translation</h4>
          <p className="text-sm whitespace-pre-wrap">{aiTranslatedContent}</p>
        </div>
      )}
    </div>
  );
};

export default TranslationContent;