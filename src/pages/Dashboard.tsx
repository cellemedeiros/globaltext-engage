import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DocumentUploadCard from "@/components/dashboard/DocumentUploadCard";
import TranslationsList from "@/components/dashboard/TranslationsList";
import SubscriptionInfo from "@/components/dashboard/SubscriptionInfo";
import ProfileSection from "@/components/sections/ProfileSection";
import TranslationStatsChart from "@/components/dashboard/stats/TranslationStatsChart";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: translations = [], isLoading: translationsLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching translations:', error);
        throw error;
      }
      return data;
    },
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found');
        return null;
      }

      console.log('Fetching subscription for user:', session.user.id);
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Subscription fetch error:', error);
          toast({
            title: "Error fetching subscription",
            description: "There was a problem loading your subscription details. Please try again.",
            variant: "destructive",
          });
          throw error;
        }

        console.log('Fetched subscription:', data);
        return data;
      } catch (error) {
        console.error('Subscription query error:', error);
        toast({
          title: "Error fetching subscription",
          description: "There was a problem loading your subscription details. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error('Subscription query error:', error);
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="grid md:grid-cols-3 gap-6">
          <DashboardStats translations={translations} />
        </div>

        <TranslationStatsChart />

        <div className="grid md:grid-cols-2 gap-6">
          <DocumentUploadCard 
            hasActiveSubscription={!!subscription}
            wordsRemaining={subscription?.words_remaining}
          />
          <SubscriptionInfo subscription={subscription} />
        </div>

        <TranslationsList isLoading={translationsLoading} />
        
        <ProfileSection />
      </div>
    </div>
  );
};

export default Dashboard;