import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface PaymentSummaryProps {
  words?: string | null;
  plan?: string | null;
  amount?: string | null;
  documentName?: string | null;
}

const PaymentSummary = ({ words, plan, amount, documentName }: PaymentSummaryProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          {documentName && (
            <div className="flex justify-between">
              <span>Document:</span>
              <span className="font-medium">{documentName}</span>
            </div>
          )}
          {words && (
            <div className="flex justify-between">
              <span>Word count:</span>
              <span className="font-medium">{words}</span>
            </div>
          )}
          {plan && (
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">{plan}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <span>Total:</span>
            <span className="font-bold text-primary">R${amount}</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Lock className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </div>
  );
};

export default PaymentSummary;