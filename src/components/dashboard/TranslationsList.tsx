import { Card } from "@/components/ui/card";
import { BookOpen, FileX } from "lucide-react";

interface Translation {
  id: string;
  document_name: string;
  source_language: string;
  target_language: string;
  status: string;
  created_at: string;
  word_count: number;
}

interface TranslationsListProps {
  translations: Translation[];
  role?: 'client' | 'translator';
  isLoading?: boolean;
}

const TranslationsList = ({ translations, role = 'client', isLoading = false }: TranslationsListProps) => {
  const title = role === 'translator' ? 'Assigned Translations' : 'Recent Translations';

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {title}
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!translations.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {title}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileX className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No translations yet</h3>
          <p className="text-muted-foreground max-w-sm">
            {role === 'translator' 
              ? "You haven't been assigned any translations yet. Check back later."
              : "You haven't submitted any translations yet. Start by uploading a document."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {translations.map((translation) => (
          <div
            key={translation.id}
            className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium mb-1">{translation.document_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {translation.source_language} → {translation.target_language}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                  {translation.status}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {translation.word_count} words
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TranslationsList;