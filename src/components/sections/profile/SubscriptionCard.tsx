import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface SubscriptionCardProps {
  subscription: Subscription | null;
  onChoosePlan: () => void;
}

const SubscriptionCard = ({ subscription, onChoosePlan }: SubscriptionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{subscription.plan_name}</p>
            <p className="text-sm text-muted-foreground">Words Remaining</p>
            <p className="font-medium">{subscription.words_remaining || 0}</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">No active subscription</p>
            <Button onClick={onChoosePlan}>
              Choose a Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;