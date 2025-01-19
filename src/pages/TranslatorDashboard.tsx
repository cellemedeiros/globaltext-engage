import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TranslatorAccessControl from "@/components/dashboard/translator/TranslatorAccessControl";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import { useToast } from "@/hooks/use-toast";
import TranslatorApplicationsList from "@/components/dashboard/admin/TranslatorApplicationsList";
import ProfileSection from "@/components/sections/ProfileSection";
import TranslatorDashboardTabs from "@/components/dashboard/translator/TranslatorDashboardTabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import TranslationsList from "@/components/dashboard/TranslationsList";
import MRRMetrics from "@/components/dashboard/MRRMetrics";
import AdminTranslationsOverview from "@/components/dashboard/admin/AdminTranslationsOverview";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

const ADMIN_USER_ID = "37665cdd-1fdd-40d0-b485-35148c159bed";

const TranslatorDashboard = () => {
  const { toast } = useToast();
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isManageTranslationsOpen, setIsManageTranslationsOpen] = useState(true);
  const [isManageTranslatorsOpen, setIsManageTranslatorsOpen] = useState(true);
  
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

  const { data: translators, isLoading: isLoadingTranslators } = useQuery({
    queryKey: ['translators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          country,
          role,
          is_approved_translator,
          created_at,
          email:id(email)
        `)
        .eq('role', 'translator')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching translators",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Transform the data to include email from the join
      const transformedData = data.map(profile => ({
        ...profile,
        email: profile.email?.email || 'No email found'
      }));

      return transformedData;
    },
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
                    <div className="rounded-md border">
                      <DataTable
                        columns={[
                          {
                            accessorKey: "email",
                            header: "Email",
                          },
                          {
                            accessorKey: "first_name",
                            header: "First Name",
                          },
                          {
                            accessorKey: "last_name",
                            header: "Last Name",
                          },
                          {
                            accessorKey: "country",
                            header: "Country",
                          },
                          {
                            accessorKey: "is_approved_translator",
                            header: "Status",
                            cell: ({ row }) => (
                              <Badge variant={row.original.is_approved_translator ? "default" : "secondary"}>
                                {row.original.is_approved_translator ? "Approved" : "Pending"}
                              </Badge>
                            ),
                          },
                          {
                            accessorKey: "created_at",
                            header: "Joined",
                            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
                          },
                        ]}
                        data={translators || []}
                        isLoading={isLoadingTranslators}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

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
