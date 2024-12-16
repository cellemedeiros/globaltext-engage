import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TranslatorAccessControl from "@/components/dashboard/translator/TranslatorAccessControl";
import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import TranslationsList from "@/components/dashboard/TranslationsList";

const ADMIN_USER_ID = "d87c0787-1b43-4c56-9f97-e1c0c69c3ab0";

const TranslatorDashboard = () => {
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

  const isAdmin = profile?.id === ADMIN_USER_ID;

  return (
    <TranslatorAccessControl>
      <div className="container mx-auto py-8 space-y-12">
        <h1 className="text-4xl font-bold">Translator Dashboard</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <TranslatorEarnings />
          {isAdmin && <TranslatorApprovals />}
        </div>

        <TranslationsList role="translator" />
      </div>
    </TranslatorAccessControl>
  );
};

export default TranslatorDashboard;