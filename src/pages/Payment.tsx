import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePaymentAuth } from "@/hooks/usePaymentAuth";
import { supabase } from "@/integrations/supabase/client";
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentProcessor from "@/components/payment/PaymentProcessor";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const { session, isCheckingAuth } = usePaymentAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const words = searchParams.get('words');
  const amount = searchParams.get('amount');
  const documentName = searchParams.get('documentName');
  const filePath = searchParams.get('filePath');
  const sourceLanguage = searchParams.get('sourceLanguage');
  const targetLanguage = searchParams.get('targetLanguage');
  const content = searchParams.get('content');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const status = searchParams.get('payment');
      if (status === 'success') {
        toast({
          title: "Payment Successful",
          description: "Your translation request has been submitted.",
        });
        navigate('/dashboard');
      }
    };

    handlePaymentSuccess();
  }, [searchParams, navigate, toast]);

  const handlePayment = async () => {
    if (!session?.user) return;

    setIsProcessing(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        throw new Error('No active session');
      }

      console.log('Creating checkout session...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          amount, 
          words,
          documentName,
          type: 'translation',
          filePath,
          sourceLanguage,
          targetLanguage,
          content
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

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Complete Your Payment</h1>
        
        <PaymentSummary 
          words={words}
          amount={amount}
          documentName={documentName}
        />

        <PaymentProcessor
          amount={amount}
          isProcessing={isProcessing}
          onSubmit={handlePayment}
        />
      </div>
    </div>
  );
};

export default Payment;