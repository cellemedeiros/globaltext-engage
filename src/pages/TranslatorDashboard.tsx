import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import ProfileSection from "@/components/sections/ProfileSection";

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
      if (!user?.email) return null;

      const { data, error } = await supabase
        .from("freelancer_applications")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile && profile.role === 'translator'
  });

  if (profileLoading || applicationLoading) {
    return <div>Loading...</div>;
  }

  // If user is not a translator, redirect to client dashboard
  if (profile?.role !== 'translator') {
    return <Navigate to="/dashboard" replace />;
  }

  // If no application found and user is a translator without approval
  if (!profile.is_approved_translator && !application) {
    toast({
      title: "Application Required",
      description: "You need to apply as a translator first.",
    });
    return <Navigate to="/?apply=true" />;
  }

  // If application exists but not approved
  if (!profile?.is_approved_translator) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <ProfileSection />
          
          <div className="bg-muted p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Application Under Review</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for applying to be a translator. Your application is currently being reviewed.
              We'll notify you once a decision has been made.
            </p>
            {application && (
              <p className="text-sm text-muted-foreground">
                Application submitted on: {new Date(application.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.id === ADMIN_USER_ID;

  return (
    <div className="container mx-auto py-8 space-y-12">
      <ProfileSection />
      
      <div className="space-y-8">
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
    </div>
  );
};

export default TranslatorDashboard;