import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users, Package, FileText } from "lucide-react";

interface MRRMetric {
  month_date: string;
  total_mrr: number;
  new_mrr: number;
  expansion_mrr: number;
  churned_mrr: number;
  total_customers: number;
  active_subscriptions: number;
  subscription_breakdown: {
    plan_name: string;
    subscription_count: number;
    plan_revenue: number;
  }[];
}

const MRRMetrics = () => {
  const { data: mrrMetrics } = useQuery({
    queryKey: ['mrr-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_mrr_metrics');

      if (error) {
        console.error('Error fetching MRR metrics:', error);
        throw error;
      }

      return data as MRRMetric[];
    },
  });

  const { data: singleTranslationsCount } = useQuery({
    queryKey: ['single-translations'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true })
        .is('subscription_id', null);

      if (error) {
        console.error('Error fetching single translations:', error);
        throw error;
      }

      return count || 0;
    },
  });

  const currentMonth = mrrMetrics?.[0];
  const previousMonth = mrrMetrics?.[1];

  const getMRRGrowth = () => {
    if (!currentMonth || !previousMonth) return 0;
    return ((currentMonth.total_mrr - previousMonth.total_mrr) / previousMonth.total_mrr) * 100;
  };

  const mrrGrowth = getMRRGrowth();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">MRR Analytics</h2>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <DollarSign className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total MRR</p>
              <p className="text-2xl font-bold">
                R${currentMonth?.total_mrr.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            {mrrGrowth >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">MRR Growth</p>
              <p className="text-2xl font-bold">
                {mrrGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">
                {currentMonth?.total_customers || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Single Translations</p>
              <p className="text-2xl font-bold">
                {singleTranslationsCount || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {currentMonth?.subscription_breakdown.map((plan) => (
          <Card key={plan.plan_name} className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground capitalize">{plan.plan_name} Plan</p>
                <p className="text-2xl font-bold">{plan.subscription_count}</p>
                <p className="text-sm text-muted-foreground">
                  Revenue: R${plan.plan_revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MRRMetrics;