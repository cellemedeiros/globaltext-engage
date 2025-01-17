import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Translation = Database['public']['Tables']['translations']['Row'] & {
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export const useAvailableTranslations = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['available-translations'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Not authenticated");
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
          throw error;
        }

        console.log('Fetched available translations:', data);
        return data as Translation[];
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};