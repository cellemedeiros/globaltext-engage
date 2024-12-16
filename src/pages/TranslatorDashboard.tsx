import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TranslatorAccessControl from "@/components/dashboard/translator/TranslatorAccessControl";
import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import TranslationsList from "@/components/dashboard/TranslationsList";
import { useToast } from "@/components/ui/use-toast";

const ADMIN_USER_ID = "d87c0787-1b43-4c56-9f97-e1c0c69c3ab0";

const TranslatorDashboard = () => {
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: translations, isLoading: translationsLoading } = useQuery({
    queryKey: ['translator-translations'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('translator_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load translations. Please try again.",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.is_approved_translator
  });

  const isAdmin = profile?.id === ADMIN_USER_ID;

  return (
    <TranslatorAccessControl>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold">Translator Dashboard</h1>
          
          <div className="grid gap-8 md:grid-cols-2">
            <TranslatorEarnings />
            {isAdmin && <TranslatorApprovals />}
          </div>

          <TranslationsList 
            translations={translations || []} 
            role="translator"
            isLoading={translationsLoading}
          />
        </div>
      </div>
    </TranslatorAccessControl>
  );
};

export default TranslatorDashboard;