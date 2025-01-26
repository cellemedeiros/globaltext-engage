import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MRRData {
  month_date: string;
  total_mrr: number;
  new_mrr: number;
  expansion_mrr: number;
  churned_mrr: number;
  total_customers: number;
  active_subscriptions: number;
  subscription_breakdown: Array<{
    plan_name: string;
    subscription_count: number;
    plan_revenue: number;
    user_id: string;
  }>;
}

const MRRMetrics = () => {
  const { data: mrrData, isLoading, error } = useQuery({
    queryKey: ["mrr-metrics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase.rpc('get_mrr_metrics');
      if (error) {
        console.error('Error fetching MRR metrics:', error);
        throw error;
      }
      
      console.log('MRR metrics data:', data); // Debug log
      return data as MRRData[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[400px] animate-pulse bg-muted rounded-lg" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error in MRRMetrics:', error);
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error loading metrics data</p>
      </div>
    );
  }

  if (!mrrData || mrrData.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No metrics data available</p>
      </div>
    );
  }

  const sortedData = [...mrrData].sort(
    (a, b) => new Date(b.month_date).getTime() - new Date(a.month_date).getTime()
  );

  const currentMonth = sortedData[0] || {
    total_mrr: 0,
    new_mrr: 0,
    expansion_mrr: 0,
    churned_mrr: 0,
    total_customers: 0,
    active_subscriptions: 0,
    subscription_breakdown: [],
  };

  const lastMonth = sortedData[1] || currentMonth;

  const getMRRGrowth = () => {
    if (!lastMonth.total_mrr) return 0;
    return ((currentMonth.total_mrr - lastMonth.total_mrr) / lastMonth.total_mrr) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const mrrGrowth = getMRRGrowth();

  const getSubscriptionsByPlan = (planName: string) => {
    if (!currentMonth?.subscription_breakdown) return null;
    
    // Aggregate subscriptions by plan name
    const planSubscriptions = currentMonth.subscription_breakdown.reduce((acc, sub) => {
      if (sub.plan_name.toLowerCase() === planName.toLowerCase()) {
        return {
          subscription_count: (acc.subscription_count || 0) + (sub.subscription_count || 1),
          plan_revenue: (acc.plan_revenue || 0) + (sub.plan_revenue || 0),
        };
      }
      return acc;
    }, { subscription_count: 0, plan_revenue: 0 });
    
    return planSubscriptions;
  };

  const standardPlan = getSubscriptionsByPlan('standard');
  const premiumPlan = getSubscriptionsByPlan('premium');
  const businessPlan = getSubscriptionsByPlan('business');

  const chartData = sortedData.map((item) => ({
    name: new Date(item.month_date).toLocaleDateString('en-US', { month: 'short' }),
    MRR: item.total_mrr || 0,
    "New Business": item.new_mrr || 0,
    Expansion: item.expansion_mrr || 0,
    Churn: Math.abs(item.churned_mrr || 0),
  })).reverse();

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Monthly Recurring Revenue</h3>
          <p className="text-sm text-muted-foreground">
            Current MRR: {formatCurrency(currentMonth.total_mrr)}
            <span className={`ml-2 ${mrrGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ({mrrGrowth >= 0 ? '+' : ''}{mrrGrowth.toFixed(1)}%)
            </span>
          </p>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="MRR"
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="New Business"
                stroke="#16a34a"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Expansion"
                stroke="#9333ea"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Churn"
                stroke="#dc2626"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Standard Plan</h3>
              <p className="text-sm text-muted-foreground">
                {standardPlan?.subscription_count || 0} active subscriptions
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(standardPlan?.plan_revenue || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Premium Plan</h3>
              <p className="text-sm text-muted-foreground">
                {premiumPlan?.subscription_count || 0} active subscriptions
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(premiumPlan?.plan_revenue || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Business Plan</h3>
              <p className="text-sm text-muted-foreground">
                {businessPlan?.subscription_count || 0} active subscriptions
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(businessPlan?.plan_revenue || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MRRMetrics;