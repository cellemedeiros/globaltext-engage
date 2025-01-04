import { format } from "date-fns";
import { FileText, Clock, Languages, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";

type TranslationWithProfile = Database['public']['Tables']['translations']['Row'] & {
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

interface TranslationCardProps {
  translation: TranslationWithProfile;
  onClaim: (translationId: string) => void;
}

const TranslationCard = ({ translation, onClaim }: TranslationCardProps) => {
  return (
    <Card key={translation.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">{translation.document_name}</h3>
            <p className="text-sm text-muted-foreground">
              Client: {translation.profiles?.first_name} {translation.profiles?.last_name}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {translation.word_count} words
              </span>
              <span className="flex items-center gap-1">
                <Languages className="h-4 w-4" />
                {translation.source_language} → {translation.target_language}
              </span>
              {translation.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Due: {format(new Date(translation.deadline), 'PPP')}
                </span>
              )}
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${translation.price_offered}
              </span>
            </div>
          </div>
          <Button
            onClick={() => onClaim(translation.id)}
            className="ml-4"
          >
            Claim Project
          </Button>
        </div>
        {translation.content && (
          <div className="mt-2 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Preview:</p>
            <p className="text-sm text-muted-foreground">
              {translation.content.slice(0, 200)}...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TranslationCard;