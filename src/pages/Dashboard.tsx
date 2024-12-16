import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DocumentUploadCard from "@/components/dashboard/DocumentUploadCard";
import TranslationsList from "@/components/dashboard/TranslationsList";
import SubscriptionInfo from "@/components/dashboard/SubscriptionInfo";
import ProfileSection from "@/components/sections/ProfileSection";

const Dashboard = () => {
  const { data: translations = [] } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6">
        <div className="grid md:grid-cols-3 gap-6">
          <DashboardStats translations={translations} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <DocumentUploadCard 
            hasActiveSubscription={!!subscription}
            wordsRemaining={subscription?.words_remaining}
          />
          <SubscriptionInfo subscription={subscription} />
        </div>

        <TranslationsList translations={translations} />
        
        <ProfileSection />
      </div>
    </div>
  );
};

export default Dashboard;