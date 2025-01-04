import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentNavigation from "@/components/payment/PaymentNavigation";
import PaymentProcessor from "@/components/payment/PaymentProcessor";
import { usePaymentAuth } from "@/hooks/usePaymentAuth";
import { useEffect } from "react";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const words = searchParams.get("words");
  const plan = searchParams.get("plan");
  const amount = searchParams.get("amount");
  
  const { session, isCheckingAuth } = usePaymentAuth();

  // Store parameters in sessionStorage to persist them during navigation
  useEffect(() => {
    if (amount) sessionStorage.setItem('payment_amount', amount);
    if (words) sessionStorage.setItem('payment_words', words);
    if (plan) sessionStorage.setItem('payment_plan', plan);
  }, [amount, words, plan]);

  // Retrieve stored values if URL parameters are missing
  const effectiveAmount = amount || sessionStorage.getItem('payment_amount');
  const effectiveWords = words || sessionStorage.getItem('payment_words');
  const effectivePlan = plan || sessionStorage.getItem('payment_plan');

  if (isCheckingAuth) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <PaymentNavigation plan={effectivePlan} words={effectiveWords} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">
            {effectivePlan 
              ? `Subscribe to ${effectivePlan} Plan` 
              : `Translation Service Payment`
            }
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr,300px] gap-8">
          <Card>
            <PaymentProcessor 
              amount={effectiveAmount}
              words={effectiveWords}
              plan={effectivePlan}
              session={session}
            />
          </Card>
          <PaymentSummary 
            words={effectiveWords}
            plan={effectivePlan}
            amount={effectiveAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;