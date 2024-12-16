import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const ADMIN_USER_ID = "37665cdd-1fdd-40d0-b485-35148c159bed";

const TranslatorDashboard = () => {
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery({
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

  const { data: application, isLoading: applicationLoading } = useQuery({
    queryKey: ["translator-application"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("freelancer_applications")
        .select("*")
        .eq("email", user.email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  if (profileLoading || applicationLoading) {
    return <div>Loading...</div>;
  }

  // If no application found or user is not approved, redirect to home
  if (!application || !profile?.is_approved_translator) {
    toast({
      title: "Access Denied",
      description: "You need to apply and be approved as a translator to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/" />;
  }

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