import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";

interface MRRMetric {
  month_date: string;
  total_mrr: number;
  new_mrr: number;
  expansion_mrr: number;
  churned_mrr: number;
  total_customers: number;
  active_subscriptions: number;
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
            <DollarSign className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">New MRR</p>
              <p className="text-2xl font-bold">
                R${currentMonth?.new_mrr.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MRRMetrics;