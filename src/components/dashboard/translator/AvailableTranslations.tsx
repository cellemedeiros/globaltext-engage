import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationCard from "./TranslationCard";
import LoadingTranslations from "./LoadingTranslations";
import { useAvailableTranslations } from "@/hooks/useAvailableTranslations";
import EmptyTranslationState from "../translations/EmptyTranslationState";

const AvailableTranslations = () => {
  const { toast } = useToast();
  const { data: translations = [], isLoading, refetch } = useAvailableTranslations();

  const handleClaimTranslation = async (translationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to claim translations",
          variant: "destructive"
        });
        return;
      }

      console.log('Claiming translation:', translationId, 'for user:', session.user.id);

      const { error } = await supabase
        .from('translations')
        .update({
          translator_id: session.user.id,
          status: 'in_progress'
        })
        .eq('id', translationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation claimed successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error claiming translation:', error);
      toast({
        title: "Error",
        description: "Failed to claim translation",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('Current translations:', translations);

    const channel = supabase
      .channel('available_translations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translations',
          filter: 'status=eq.pending'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Translation Available",
              description: `A new translation request for ${payload.new.document_name} is available`,
            });
          }
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast, translations]);

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
                  onClaim={() => handleClaimTranslation(translation.id)}
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