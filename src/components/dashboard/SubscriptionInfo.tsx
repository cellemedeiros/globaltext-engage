import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Subscription {
  plan_name: string;
  words_remaining: number;
  expires_at: string;
  status: string;
}

const SubscriptionInfo = ({ subscription }: { subscription: Subscription | null }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: activeSubscription, isLoading } = useQuery({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      console.log('Fetching subscription data...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found');
        return null;
      }

      console.log('Session found, user ID:', session.user.id);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription details",
          variant: "destructive",
        });
        return null;
      }

      console.log('Fetched subscription data:', data);
      return data;
    },
  });

  useEffect(() => {
    const setupSubscription = async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.user) {
        console.log('No auth session found in SubscriptionInfo');
        return;
      }

      console.log('Setting up subscription channel for user:', authData.session.user.id);

      const channel = supabase
        .channel('subscription-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${authData.session.user.id}`,
          },
          (payload) => {
            console.log('Subscription update received:', payload);
            toast({
              title: "Subscription Updated",
              description: "Your subscription status has been updated.",
            });
            // Force a page reload to reflect the new subscription status
            window.location.reload();
          }
        )
        .subscribe((status) => {
          console.log('Subscription channel status:', status);
        });

      return () => {
        console.log('Cleaning up subscription channel');
        channel.unsubscribe();
      };
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [toast]);

  const handleUpgrade = () => {
    if (!activeSubscription) {
      console.log('No subscription, redirecting to pricing');
      navigate('/#pricing');
      return;
    }
    
    console.log('Current subscription plan:', activeSubscription.plan_name);
    if (activeSubscription.plan_name === 'Business') {
      navigate('/#contact');
    } else if (activeSubscription.plan_name === 'Standard' || activeSubscription.plan_name === 'Premium') {
      navigate('/#contact');
    } else {
      navigate('/#pricing');
    }
  };

  const getInitialWordCount = (planName: string) => {
    switch (planName) {
      case 'Standard':
        return 5000;
      case 'Premium':
        return 15000;
      case 'Business':
        return Number.POSITIVE_INFINITY;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Subscription Status</h2>
      
      {activeSubscription ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="font-medium">{activeSubscription.plan_name}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{activeSubscription.status}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Words Remaining</p>
            <p className="font-medium">
              {activeSubscription.plan_name === 'Business' 
                ? 'Unlimited' 
                : activeSubscription.words_remaining ?? getInitialWordCount(activeSubscription.plan_name)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Expires On</p>
            <p className="font-medium">
              {new Date(activeSubscription.expires_at).toLocaleDateString('en-US')}
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleUpgrade}
          >
            {activeSubscription.plan_name === 'Business' ? 'Contact Support' : 'Contact Us for Business Plan'}
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No active subscription</p>
          <Button 
            className="w-full" 
            onClick={handleUpgrade}
          >
            Subscribe Now
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SubscriptionInfo;