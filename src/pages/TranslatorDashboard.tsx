import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TranslatorAccessControl from "@/components/dashboard/translator/TranslatorAccessControl";
import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import { useToast } from "@/components/ui/use-toast";
import TranslatorApplicationsList from "@/components/dashboard/admin/TranslatorApplicationsList";
import ProfileSection from "@/components/sections/ProfileSection";
import TranslatorDashboardTabs from "@/components/dashboard/translator/TranslatorDashboardTabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";

const ADMIN_USER_ID = "37665cdd-1fdd-40d0-b485-35148c159bed";

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

  const { isLoading: translationsLoading } = useQuery({
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto py-8 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            <div className="flex justify-between items-center">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold text-gray-800"
              >
                Translator Workspace
              </motion.h1>
              <NotificationsPopover />
            </div>
            
            {isAdmin && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <Collapsible className="w-full border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
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

                <Collapsible className="w-full border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center">
                      <span>Manage Translators</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <TranslatorApprovals />
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-8 md:grid-cols-2"
            >
              <TranslatorEarnings />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ProfileSection />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <TranslatorDashboardTabs 
                isLoading={translationsLoading}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </TranslatorAccessControl>
  );
};

export default TranslatorDashboard;