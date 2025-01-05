import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationCard from "./TranslationCard";
import LoadingTranslations from "./LoadingTranslations";
import { useAvailableTranslations } from "@/hooks/useAvailableTranslations";
import { Button } from "@/components/ui/button";

const AvailableTranslations = () => {
  const { toast } = useToast();
  const { data: translations, isLoading, refetch } = useAvailableTranslations();

  const createTestTranslation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to create a test translation",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: "Test Document",
          source_language: "English",
          target_language: "Spanish",
          word_count: 500,
          status: "pending",
          amount_paid: 25.00,
          content: "This is a test document for translation.",
          price_offered: 50.00
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test translation created successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error creating test translation:', error);
      toast({
        title: "Error",
        description: "Failed to create test translation",
        variant: "destructive"
      });
    }
  };

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
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Available Translations
          </div>
          <Button 
            onClick={createTestTranslation}
            variant="outline"
            size="sm"
          >
            Create Test Translation
          </Button>
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
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No available translations at the moment</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AvailableTranslations;