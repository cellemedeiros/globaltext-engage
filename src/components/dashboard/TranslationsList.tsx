import { Card } from "@/components/ui/card";
import { BookOpen, Clock } from "lucide-react";

interface Translation {
  id: string;
  document_name: string;
  source_language: string;
  target_language: string;
  status: string;
  created_at: string;
  word_count: number;
}

const TranslationsList = ({ translations }: { translations: Translation[] }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Recent Translations
        </h2>
      </div>

      <div className="space-y-4">
        {translations.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No translations yet
          </p>
        ) : (
          translations.map((translation) => (
            <div
              key={translation.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <h3 className="font-medium">{translation.document_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {translation.source_language} → {translation.target_language}
                </p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {new Date(translation.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {translation.status}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {translation.word_count} words
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TranslationsList;