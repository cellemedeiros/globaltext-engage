import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import TranslationsList from "@/components/dashboard/TranslationsList";
import SubscriptionInfo from "@/components/dashboard/SubscriptionInfo";
import DashboardStats from "@/components/dashboard/DashboardStats";

const Dashboard = () => {
  const { data: translations, isLoading: translationsLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  if (translationsLoading || subscriptionLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <DashboardStats translations={translations || []} />
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
        <TranslationsList translations={translations || []} />
        <SubscriptionInfo subscription={subscription} />
      </div>
    </div>
  );
};

export default Dashboard;