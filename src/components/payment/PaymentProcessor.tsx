import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

interface PaymentProcessorProps {
  amount: string | null;
  words: string | null;
  plan: string | null;
  session: Session | null;
  documentName?: string | null;
}

const PaymentProcessor = ({ amount, words, plan, session, documentName }: PaymentProcessorProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with the payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        throw new Error('No active session');
      }

      console.log('Creating checkout session with token:', currentSession.access_token);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          amount, 
          words, 
          plan,
          documentName,
          type: plan ? 'subscription' : 'translation'
        },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <Button 
        onClick={handlePayment}
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : `Proceed to Payment - R$${amount}`}
      </Button>
    </div>
  );
};

export default PaymentProcessor;