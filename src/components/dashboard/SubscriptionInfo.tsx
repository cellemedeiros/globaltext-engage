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
      if (!authData.session?.user) return;

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
              title: "Assinatura atualizada",
              description: "O status da sua assinatura foi atualizado.",
            });
            // Force a page refresh to get the latest subscription data
            window.location.reload();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [toast]);

  const handleUpgrade = () => {
    if (!subscription) {
      navigate('/#pricing');
      return;
    }
    
    if (subscription.plan_name === 'Standard' || subscription.plan_name === 'Premium') {
      navigate('/payment?plan=Business&amount=2500');
    } else {
      navigate('/#pricing');
    }
  };

  console.log('Current subscription:', subscription);

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
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{subscription.status}</p>
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