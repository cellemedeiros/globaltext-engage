import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import TranslationsList from "@/components/dashboard/TranslationsList";
import SubscriptionInfo from "@/components/dashboard/SubscriptionInfo";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProfileSection from "@/components/sections/ProfileSection";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // First, fetch the user's profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) {
        // If no profile exists, redirect to home page
        toast({
          title: "Profile not found",
          description: "Please complete your profile setup",
          variant: "destructive",
        });
        navigate('/');
        return null;
      }
      return data;
    },
  });

  const { data: translations, isLoading: translationsLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile, // Only fetch translations if we have a profile
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile, // Only fetch subscription if we have a profile
  });

  if (profileLoading || translationsLoading || subscriptionLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!profile) {
    return null; // Navigation will happen in the profile query
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <ProfileSection />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardStats translations={translations || []} />
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <TranslationsList translations={translations || []} />
          <SubscriptionInfo subscription={subscription} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;