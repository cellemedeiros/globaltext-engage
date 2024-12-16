import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount");
  const words = searchParams.get("words");
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      // Here you would integrate with a payment provider
      toast({
        title: "Payment initiated",
        description: "You will be redirected to complete your payment.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-6">Complete Your Payment</h1>
          <div className="space-y-4">
            <div className="bg-secondary/30 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <p className="text-gray-700 mb-2">Word count: {words}</p>
              <p className="text-gray-700 mb-4">Total amount: R${amount}</p>
            </div>
            <Button 
              onClick={handlePayment}
              className="w-full hover:scale-105 transition-transform"
            >
              Pay R${amount}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;