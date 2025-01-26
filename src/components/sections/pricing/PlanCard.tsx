import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "@/components/auth/AuthDialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Feature {
  text: string;
  available: boolean;
}

interface PlanProps {
  name: string;
  price: string;
  period?: string;
  features: Feature[];
  popular?: boolean;
  isAuthenticated: boolean;
  onAuthChange: (showDialog: boolean) => void;
}

const PlanCard = ({ 
  name, 
  price, 
  period, 
  features, 
  popular, 
  isAuthenticated,
  onAuthChange 
}: PlanProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handlePlanSelection = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      toast({
        title: "Authentication Required",
        description: "Please sign in or create an account to select a plan.",
      });
      return;
    }

    // Check if user has an active subscription
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue.",
      });
      return;
    }

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (name === "Business") {
      // Handle business plan contact logic
      return;
    }

    if (subscriptions) {
      toast({
        title: "Active Subscription",
        description: "You already have an active subscription. Please cancel your current plan before switching.",
      });
      navigate('/dashboard');
      return;
    }

    // For subscription plans, convert price to number and navigate to payment
    const amount = name === "Standard" ? "400" : name === "Premium" ? "1200" : "";
    navigate(`/payment?plan=${name}&amount=${amount}&type=subscription`);
  };

  return (
    <>
      <Card 
        className={`relative flex flex-col h-full ${
          popular 
            ? 'border-primary shadow-lg scale-105' 
            : 'hover:shadow-md'
        } hover:scale-105 transition-all duration-300`}
      >
        {popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
        )}
        
        <CardHeader className="text-center pt-8">
          <h3 className="text-2xl font-bold mb-2">{name}</h3>
          <div className="text-3xl font-bold text-primary">
            {price}
            {period && <span className="text-base font-normal text-muted-foreground">{period}</span>}
          </div>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col">
          <ul className="space-y-4 mb-8 flex-grow">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                {feature.available ? (
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                )}
                <span className={feature.available ? "text-foreground" : "text-muted-foreground"}>{feature.text}</span>
              </li>
            ))}
          </ul>

          <Button 
            className={`w-full mt-auto ${
              name === "Business" 
                ? 'bg-secondary hover:bg-secondary/90' 
                : ''
            }`}
            onClick={handlePlanSelection}
          >
            {name === "Business" ? (
              <>
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Sales
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </CardContent>
      </Card>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        message={`Sign in or create an account to get started with the ${name} plan.`}
      />
    </>
  );
};

export default PlanCard;