import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Subscription {
  plan_name: string;
  words_remaining: number;
  expires_at: string;
}

const SubscriptionInfo = ({ subscription }: { subscription: Subscription | null }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // If user has no subscription, navigate to payment with Business plan
    if (!subscription) {
      navigate('/#pricing');
      return;
    }
    
    // If upgrading from Standard or Premium to Business
    if (subscription.plan_name === 'Standard' || subscription.plan_name === 'Premium') {
      navigate('/payment?plan=Business&amount=2500');
    } else {
      // For Business users or other cases, show pricing options
      navigate('/#pricing');
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
            <p className="text-sm text-muted-foreground">Words Remaining</p>
            <p className="font-medium">{subscription.words_remaining}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Expires</p>
            <p className="font-medium">
              {new Date(subscription.expires_at).toLocaleDateString()}
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleUpgrade}
          >
            {subscription.plan_name === 'Business' ? 'Manage Subscription' : 'Upgrade to Business'}
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No active subscription</p>
          <Button 
            className="w-full" 
            onClick={handleUpgrade}
          >
            Subscribe
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SubscriptionInfo;