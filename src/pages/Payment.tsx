import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import PaymentForm from "@/components/payment/PaymentForm";
import PaymentSummary from "@/components/payment/PaymentSummary";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const words = searchParams.get("words");
  const plan = searchParams.get("plan");
  const amount = words ? (Number(words) * 0.20).toString() : searchParams.get("amount"); // R$0.20 per word
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user has an active subscription
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // If user has an active subscription with enough words, redirect to dashboard
  if (subscription && words && subscription.words_remaining >= parseInt(words)) {
    navigate('/dashboard');
    return null;
  }

  const handlePayment = async (values: any) => {
    setIsProcessing(true);
    try {
      // Create a payment session in Supabase
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: { amount, words, plan, billingDetails: values }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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