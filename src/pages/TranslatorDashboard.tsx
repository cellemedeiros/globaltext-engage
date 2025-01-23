import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import TranslatorAccessControl from "@/components/dashboard/translator/TranslatorAccessControl";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import ProfileSection from "@/components/sections/ProfileSection";
import TranslatorDashboardTabs from "@/components/dashboard/translator/TranslatorDashboardTabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslationsList from "@/components/dashboard/TranslationsList";
import MRRMetrics from "@/components/dashboard/MRRMetrics";
import AdminTranslationsOverview from "@/components/dashboard/admin/AdminTranslationsOverview";
import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import WithdrawalRequestsTable from "@/components/dashboard/admin/WithdrawalRequestsTable";
import { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

const ADMIN_USER_ID = "37665cdd-1fdd-40d0-b485-35148c159bed";

type Profile = Database['public']['Tables']['profiles']['Row'];

const TranslatorDashboard = () => {
  const { toast } = useToast();
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isManageTranslationsOpen, setIsManageTranslationsOpen] = useState(false);
  const [isManageTranslatorsOpen, setIsManageTranslatorsOpen] = useState(false);
  const [isWithdrawalsOpen, setIsWithdrawalsOpen] = useState(false);
  
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
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link to="/admin/applications">
                    <Button variant="outline">
                      View Applications
                    </Button>
                  </Link>
                )}
                <NotificationsPopover />
              </div>
            </div>
            
            {isAdmin && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <MRRMetrics />

                <Collapsible 
                  open={isOverviewOpen}
                  onOpenChange={setIsOverviewOpen}
                  className="w-full space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">All Translations Overview</h2>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOverviewOpen ? 'transform rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <AdminTranslationsOverview />
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible 
                  open={isManageTranslationsOpen}
                  onOpenChange={setIsManageTranslationsOpen}
                  className="w-full border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center">
                      <span>Manage Translations</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isManageTranslationsOpen ? 'transform rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <TranslationsList role="admin" />
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible 
                  open={isManageTranslatorsOpen}
                  onOpenChange={setIsManageTranslatorsOpen}
                  className="w-full border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center">
                      <span>Manage Translators</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isManageTranslatorsOpen ? 'transform rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <TranslatorApprovals />
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible 
                  open={isWithdrawalsOpen}
                  onOpenChange={setIsWithdrawalsOpen}
                  className="w-full border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center">
                      <span>Withdrawal Requests</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isWithdrawalsOpen ? 'transform rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <WithdrawalRequestsTable />
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-8"
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
                isLoading={false}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </TranslatorAccessControl>
  );
};

export default TranslatorDashboard;