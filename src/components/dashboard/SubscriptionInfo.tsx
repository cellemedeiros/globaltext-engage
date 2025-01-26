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
}

const SubscriptionInfo = ({ subscription }: { subscription: Subscription | null }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to real-time changes on the subscriptions table
    const channel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        },
        (payload) => {
          console.log('Subscription update:', payload);
          // Show a toast notification when subscription is updated
          toast({
            title: "Assinatura atualizada",
            description: "O status da sua assinatura foi atualizado.",
          });
          // The parent component (ProfileSection) will automatically refresh the data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

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
      <h2 className="text-xl font-semibold mb-6">Status da Assinatura</h2>
      
      {subscription ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Plano Atual</p>
            <p className="font-medium">{subscription.plan_name}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Palavras Restantes</p>
            <p className="font-medium">{subscription.words_remaining}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Expira em</p>
            <p className="font-medium">
              {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleUpgrade}
          >
            {subscription.plan_name === 'Business' ? 'Gerenciar Assinatura' : 'Upgrade para Business'}
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Nenhuma assinatura ativa</p>
          <Button 
            className="w-full" 
            onClick={handleUpgrade}
          >
            Assinar Agora
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SubscriptionInfo;