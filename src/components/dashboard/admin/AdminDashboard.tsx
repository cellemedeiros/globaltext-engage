import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, TrendingUp, Users, FileText, DollarSign } from "lucide-react";
import TranslatorApplicationsList from "../admin/TranslatorApplicationsList";
import TranslatorApprovals from "../TranslatorApprovals";
import TranslationsList from "../TranslationsList";
import TranslatorDashboardTabs from "../translator/TranslatorDashboardTabs";

interface DashboardStats {
  total_clients: number;
  active_clients: number;
  new_clients_30d: number;
  total_translators: number;
  approved_translators: number;
  total_translations: number;
  completed_translations: number;
  pending_translations: number;
  total_words: number;
  total_revenue: number;
  subscription_breakdown: Array<{
    plan_name: string;
    subscription_count: number;
    plan_revenue: number;
  }>;
}

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      if (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
      }
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading dashboard stats...</div>;
  }

  const mrr = stats?.subscription_breakdown?.reduce((acc, sub) => acc + sub.plan_revenue, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <DollarSign className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">R${mrr.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-bold">{stats?.active_clients || 0}</p>
              <p className="text-sm text-muted-foreground">+{stats?.new_clients_30d || 0} this month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Words</p>
              <p className="text-2xl font-bold">{stats?.total_words || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Active Translators</p>
              <p className="text-2xl font-bold">{stats?.approved_translators || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Management Sections */}
      <Tabs defaultValue="translators" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="translators" className="flex-1">Translator Management</TabsTrigger>
          <TabsTrigger value="translations" className="flex-1">Translation Management</TabsTrigger>
          <TabsTrigger value="applications" className="flex-1">Applications</TabsTrigger>
          <TabsTrigger value="workspace" className="flex-1">Translation Workspace</TabsTrigger>
        </TabsList>

        <TabsContent value="translators" className="mt-6">
          <TranslatorApprovals />
        </TabsContent>

        <TabsContent value="translations" className="mt-6">
          <TranslationsList role="admin" isLoading={false} />
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <TranslatorApplicationsList />
        </TabsContent>

        <TabsContent value="workspace" className="mt-6">
          <TranslatorDashboardTabs isLoading={false} />
        </TabsContent>
      </Tabs>

      {/* Subscription Breakdown */}
      <Collapsible className="w-full border rounded-lg p-4 bg-white">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between items-center">
            <span>Subscription Breakdown</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-4">
            {stats?.subscription_breakdown.map((sub, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{sub.plan_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {sub.subscription_count} active subscriptions
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    R${sub.plan_revenue.toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AdminDashboard;