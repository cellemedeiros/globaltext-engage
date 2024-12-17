import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import TranslatorAccessControl from "@/components/dashboard/translator/TranslatorAccessControl";
import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import { useToast } from "@/components/ui/use-toast";
import TranslatorApplicationsList from "@/components/dashboard/admin/TranslatorApplicationsList";
import ProfileSection from "@/components/sections/ProfileSection";
import TranslatorDashboardHeader from "@/components/dashboard/translator/TranslatorDashboardHeader";
import TranslatorDashboardTabs from "@/components/dashboard/translator/TranslatorDashboardTabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const ADMIN_USER_ID = "37665cdd-1fdd-40d0-b485-35148c159bed";

const TranslatorDashboard = () => {
  const { toast } = useToast();
  const location = useLocation();

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
  const isAdminApplicationsRoute = location.pathname === '/admin/applications';

  return (
    <TranslatorAccessControl>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <TranslatorDashboardHeader />
            
            {isAdmin && !isAdminApplicationsRoute && (
              <div className="space-y-4">
                <Collapsible className="w-full border rounded-lg p-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center">
                      <span>Manage Applications</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <TranslatorApplicationsList />
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible className="w-full border rounded-lg p-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center">
                      <span>Manage Active Translators</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <TranslatorApprovals />
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible className="w-full border rounded-lg p-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center">
                      <span>Manage Pending Translators</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <TranslatorApprovals isPending />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {!isAdminApplicationsRoute && (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  <TranslatorEarnings />
                </div>

                <ProfileSection />

                <TranslatorDashboardTabs 
                  translations={translations || []}
                  isLoading={translationsLoading}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </TranslatorAccessControl>
  );
};

export default TranslatorDashboard;