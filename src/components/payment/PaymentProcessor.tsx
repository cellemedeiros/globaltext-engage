import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface PaymentProcessorProps {
  amount: string | null;
  words: string | null;
  plan: string | null;
}

const PaymentProcessor = ({ amount, words, plan }: PaymentProcessorProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: session, isLoading: isCheckingAuth } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { amount, words, plan },
        headers: {
          Authorization: `Bearer ${session.access_token}`
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

  if (isCheckingAuth) {
    return (
      <div className="p-6">
        <Button disabled className="w-full">Loading...</Button>
      </div>
    );
  }

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