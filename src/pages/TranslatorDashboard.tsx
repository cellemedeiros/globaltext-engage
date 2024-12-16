import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TranslatorDashboard = () => {
  const { data: profile } = useQuery({
    queryKey: ["current-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-8 space-y-12">
      <h1 className="text-3xl font-bold">Translator Dashboard</h1>
      
      {/* Earnings section visible to all translators */}
      <TranslatorEarnings />
      
      {/* Management section only visible to approved translators */}
      {profile?.is_approved_translator && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Translator Management</h2>
          <TranslatorApprovals />
        </div>
      )}
    </div>
  );
};

export default TranslatorDashboard;