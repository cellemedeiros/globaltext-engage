import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface SubscriptionCardProps {
  subscription: Subscription | null;
  onChoosePlan: () => void;
}

const SubscriptionCard = ({ subscription, onChoosePlan }: SubscriptionCardProps) => {
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
            onClick={onChoosePlan}
          >
            Upgrade Plan
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No active subscription</p>
          <Button 
            className="w-full" 
            onClick={onChoosePlan}
          >
            Get Started
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SubscriptionCard;