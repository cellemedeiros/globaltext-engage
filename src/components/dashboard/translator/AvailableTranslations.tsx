import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Clock, Languages, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type Translation = Database['public']['Tables']['translations']['Row'] & {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

const AvailableTranslations = () => {
  const { toast } = useToast();

  const { data: translations, isLoading, refetch } = useQuery({
    queryKey: ['available-translations'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      // Fetch translations that are pending and have no assigned translator
      const { data, error } = await supabase
        .from('translations')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('status', 'pending')
        .is('translator_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching translations:', error);
        throw error;
      }

      return (data || []) as Translation[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('translations_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translations',
          filter: 'status=eq.pending'
        },
        (payload) => {
          toast({
            title: "Translation Update",
            description: payload.eventType === 'INSERT' 
              ? `New translation available: ${payload.new.document_name}`
              : "Translations list updated",
          });
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, refetch]);

  const handleClaimTranslation = async (translationId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('translations')
      .update({ 
        translator_id: session.user.id,
        status: 'in_progress'
      })
      .eq('id', translationId);

    if (error) {
      console.error('Error claiming translation:', error);
      toast({
        title: "Error",
        description: "Failed to claim translation. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Translation claimed successfully!",
    });
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Available Translations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Available Translations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {translations?.map((translation) => (
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
                      onClick={() => handleClaimTranslation(translation.id)}
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
            ))}
            {translations?.length === 0 && (
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