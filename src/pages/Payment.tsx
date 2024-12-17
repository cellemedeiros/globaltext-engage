import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentNavigation from "@/components/payment/PaymentNavigation";
import PaymentProcessor from "@/components/payment/PaymentProcessor";
import { usePaymentAuth } from "@/hooks/usePaymentAuth";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const words = searchParams.get("words");
  const plan = searchParams.get("plan");
  const amount = searchParams.get("amount");
  
  const { session, isCheckingAuth } = usePaymentAuth();

  if (isCheckingAuth) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <PaymentNavigation plan={plan} words={words} />

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
          <Card>
            <PaymentProcessor 
              amount={amount}
              words={words}
              plan={plan}
              session={session}
            />
          </Card>
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