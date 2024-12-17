import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import PaymentForm from "@/components/payment/PaymentForm";
import PaymentSummary from "@/components/payment/PaymentSummary";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const words = searchParams.get("words");
  const plan = searchParams.get("plan");
  const amount = searchParams.get("amount");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Check authentication status
  const { data: session, isLoading: isCheckingAuth } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with the payment.",
        variant: "destructive",
      });
      navigate('/', { replace: true });
    }
  }, [session, isCheckingAuth, navigate, toast]);

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
        body: { amount, words },
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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-8 hover:bg-secondary/50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">
            {plan 
              ? `Subscribe to ${plan} Plan` 
              : `Translation Service Payment`
            }
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr,300px] gap-8">
          <PaymentForm 
            onSubmit={handlePayment}
            isProcessing={isProcessing}
            amount={amount}
          />
          <PaymentSummary 
            words={words}
            plan={plan}
            amount={amount}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;