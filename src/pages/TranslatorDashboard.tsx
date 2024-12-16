import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_USER_ID = "37665cdd-1fdd-40d0-b485-35148c159bed";

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

  const isAdmin = profile?.id === ADMIN_USER_ID;

  return (
    <div className="container mx-auto py-8 space-y-12">
      <h1 className="text-3xl font-bold">Translator Dashboard</h1>
      
      {/* Earnings section visible to all translators */}
      <TranslatorEarnings />
      
      {/* Management section only visible to admin user */}
      {isAdmin && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Translator Management</h2>
          <TranslatorApprovals />
        </div>
      )}
    </div>
  );
};

export default TranslatorDashboard;