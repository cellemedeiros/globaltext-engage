import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Translator Dashboard</h1>
      
      {/* Only show the approvals section if the current user is an approved translator */}
      {profile?.is_approved_translator && (
        <div className="mt-8">
          <TranslatorApprovals />
        </div>
      )}
    </div>
  );
};

export default TranslatorDashboard;