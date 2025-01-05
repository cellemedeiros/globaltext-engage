import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationCard from "./TranslationCard";
import { Database } from "@/integrations/supabase/types";

type Translation = Database['public']['Tables']['translations']['Row'] & {
  profiles: {
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
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to view available translations",
          variant: "destructive"
        });
        return [];
      }

      // First, verify the user is a translator
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_approved_translator')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return [];
      }

      if (!profile || (profile.role !== 'translator' && !profile.is_approved_translator)) {
        toast({
          title: "Access Denied",
          description: "You must be an approved translator to view available translations",
          variant: "destructive"
        });
        return [];
      }

      // Fetch all pending translations that haven't been claimed
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
        toast({
          title: "Error",
          description: "Failed to fetch available translations",
          variant: "destructive"
        });
        return [];
      }

      return data as Translation[];
    },
  });

  // Set up real-time subscription for new translations
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
          console.log('Realtime update received:', payload);
          refetch();
          toast({
            title: "New Translation Available",
            description: "A new translation has been added to the queue",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Translations</CardTitle>
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
            {translations?.map((translation) => (
              <TranslationCard
                key={translation.id}
                translation={translation}
                onClaim={() => refetch()}
              />
            ))}
            {(!translations || translations.length === 0) && (
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