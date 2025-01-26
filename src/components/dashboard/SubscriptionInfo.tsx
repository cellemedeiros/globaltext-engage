import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Subscription {
  plan_name: string;
  words_remaining: number;
  expires_at: string;
  status: string;
}

const SubscriptionInfo = ({ subscription }: { subscription: Subscription | null }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const setupSubscription = async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.user) {
        console.log('No auth session found in SubscriptionInfo');
        return;
      }

      console.log('Setting up subscription channel for user:', authData.session.user.id);

      channel = supabase
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
    };

    setupSubscription();

    return () => {
      if (channel) {
        console.log('Cleaning up subscription channel');
        supabase.removeChannel(channel);
      }
    };
  }, [toast]);

  const handleUpgrade = () => {
    if (!subscription) {
      console.log('No subscription, redirecting to pricing');
      navigate('/#pricing');
      return;
    }
    
    console.log('Current subscription plan:', subscription.plan_name);
    if (subscription.plan_name === 'Business') {
      navigate('/#contact'); // Redirect to contact section for Business plan
    } else if (subscription.plan_name === 'Standard' || subscription.plan_name === 'Premium') {
      navigate('/#contact'); // Redirect to contact section for Business plan upgrade
    } else {
      navigate('/#pricing');
    }
  };

  console.log('Rendering SubscriptionInfo with subscription:', subscription);

  const getInitialWordCount = (planName: string) => {
    switch (planName) {
      case 'Standard':
        return 5000;
      case 'Premium':
        return 15000;
      case 'Business':
        return Number.POSITIVE_INFINITY; // Represents unlimited words
      default:
        return 0;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Subscription Status</h2>
      
      {subscription ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="font-medium">{subscription.plan_name}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{subscription.status}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Words Remaining</p>
            <p className="font-medium">
              {subscription.plan_name === 'Business' 
                ? 'Unlimited' 
                : subscription.words_remaining ?? getInitialWordCount(subscription.plan_name)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Expires On</p>
            <p className="font-medium">
              {new Date(subscription.expires_at).toLocaleDateString('en-US')}
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleUpgrade}
          >
            {subscription.plan_name === 'Business' ? 'Contact Support' : 'Contact Us for Business Plan'}
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