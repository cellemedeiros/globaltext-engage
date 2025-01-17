import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTranslations = (role: 'client' | 'translator' | 'admin') => {
  return useQuery({
    queryKey: ['translations', role],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      console.log('Fetching translations for role:', role);
      console.log('User ID:', session.user.id);

      let query = supabase
        .from('translations')
        .select(`
          *,
          profiles!translations_user_id_fkey (
            first_name,
            last_name,
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'translator') {
        query = query
          .eq('translator_id', session.user.id)
          .in('status', ['in_progress', 'pending_review', 'completed']);
      } else if (role === 'admin') {
        // For admin, show all translations
        console.log('Fetching all translations for admin');
      } else {
        // For clients, show all their translations using auth.uid()
        console.log('Fetching client translations for user:', session.user.id);
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