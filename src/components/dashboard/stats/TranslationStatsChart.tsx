import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChartData {
  name: string;
  completed: number;
  pending: number;
}

const TranslationStatsChart = () => {
  const { data: translations } = useQuery({
    queryKey: ['translations-stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      return data || [];
    },
  });

  const getMonthlyStats = () => {
    if (!translations) return [];

    const monthlyData: Record<string, { completed: number; pending: number }> = {};
    
    translations.forEach((translation) => {
      const date = new Date(translation.created_at);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { completed: 0, pending: 0 };
      }
      
      if (translation.status === 'completed') {
        monthlyData[monthYear].completed += 1;
      } else {
        monthlyData[monthYear].pending += 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([name, stats]) => ({
        name,
        ...stats
      }))
      .slice(-6); // Last 6 months
  };

  const chartData = getMonthlyStats();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Translation Activity</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" name="Completed" fill="#22c55e" />
            <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TranslationStatsChart;