import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentProcessorProps {
  amount: string | null;
  words: string | null;
  plan: string | null;
  session: Session | null;
}

const PaymentProcessor = ({ amount, words, plan, session }: PaymentProcessorProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

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
      
      if (!currentSession) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { amount, words, plan },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Store payment details in localStorage before redirecting
        localStorage.setItem('pendingPayment', JSON.stringify({
          amount,
          words,
          plan,
          timestamp: new Date().toISOString()
        }));
        
        // Invalidate queries to ensure fresh data after payment
        queryClient.invalidateQueries({ queryKey: ['translations'] });
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        
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