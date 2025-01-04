import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTranslations = (role: 'client' | 'translator' | 'admin') => {
  return useQuery({
    queryKey: ['translations', role],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      let query = supabase
        .from('translations')
        .select('*')
        .order('created_at', { ascending: false });

      if (role === 'translator') {
        query = query
          .eq('translator_id', session.user.id)
          .eq('status', 'pending_review');
      } else if (role === 'admin') {
        query = query.eq('status', 'pending_admin_review');
      } else {
        // For clients, show all their translations
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
  });
};