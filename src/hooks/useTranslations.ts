import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTranslations = (role: 'client' | 'translator' | 'admin') => {
  return useQuery({
    queryKey: ['translations', role],
    queryFn: async () => {
      console.log('Fetching translations for role:', role);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      let query = supabase
        .from('translations')
        .select('*')
        .order('created_at', { ascending: false });

      if (role === 'translator') {
        // For translators, show translations they're reviewing or available translations
        query = query
          .or(`translator_id.eq.${session.user.id},and(translator_id.is.null,status.eq.pending)`);
      } else if (role === 'admin') {
        query = query.eq('status', 'pending_admin_review');
      } else {
        // For clients, show their own translations
        query = query.eq('user_id', session.user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching translations:', error);
        throw error;
      }
      
      console.log('Fetched translations:', data);
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};