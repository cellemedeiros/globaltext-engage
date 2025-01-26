import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentProcessorProps {
  amount: string | null;
  words?: string | null;
  plan?: string | null;
  session: Session | null;
  documentName?: string | null;
  filePath?: string | null;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
  content?: string | null;
  onSubmit?: () => Promise<void>;
}

const PaymentProcessor = ({ 
  amount, 
  words, 
  plan, 
  session, 
  documentName,
  filePath,
  sourceLanguage,
  targetLanguage,
  content,
  onSubmit 
}: PaymentProcessorProps) => {
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
      if (onSubmit) {
        await onSubmit();
        return;
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        throw new Error('No active session');
      }

      console.log('Creating checkout session...', {
        amount,
        words,
        plan,
        email: session.user.email,
        user_id: session.user.id,
        documentName,
        filePath,
        sourceLanguage,
        targetLanguage,
        content
      });
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          amount, 
          words, 
          plan,
          email: session.user.email,
          user_id: session.user.id,
          documentName,
          filePath,
          sourceLanguage,
          targetLanguage,
          content,
          type: plan ? 'subscription' : 'payment'
        },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
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
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        ) : (
          `Pay R$${amount || ""}`
        )}
      </Button>
    </div>
  );
};

export default PaymentProcessor;