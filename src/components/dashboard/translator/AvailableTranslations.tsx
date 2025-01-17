import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationCard from "./TranslationCard";
import LoadingTranslations from "./LoadingTranslations";
import { useAvailableTranslations } from "@/hooks/useAvailableTranslations";
import EmptyTranslationState from "../translations/EmptyTranslationState";

const AvailableTranslations = () => {
  const { data: translations = [], isLoading, refetch } = useAvailableTranslations();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Translations</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingTranslations />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Available Translations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {translations && translations.length > 0 ? (
              translations.map((translation) => (
                <TranslationCard
                  key={translation.id}
                  translation={translation}
                  onClaim={() => refetch()}
                />
              ))
            ) : (
              <EmptyTranslationState type="default" />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AvailableTranslations;