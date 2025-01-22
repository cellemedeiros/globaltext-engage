import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const WithdrawalSection = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: availableBalance = 0 } = useQuery({
    queryKey: ['translator-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('translations')
        .select('price_offered')
        .eq('translator_id', user.id)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching balance:', error);
        throw error;
      }

      const totalEarned = data?.reduce((sum, t) => sum + (t.price_offered || 0), 0) || 0;

      // Get total withdrawn amount
      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('translator_id', user.id)
        .in('status', ['pending', 'approved']);

      if (withdrawalError) {
        console.error('Error fetching withdrawals:', withdrawalError);
        throw withdrawalError;
      }

      const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      return totalEarned - totalWithdrawn;
    },
  });

  const { data: withdrawalHistory } = useQuery({
    queryKey: ['withdrawal-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('translator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawal history:', error);
        throw error;
      }

      return data;
    },
  });

  const handleWithdrawalRequest = async () => {
    if (!amount || !paymentMethod || !paymentDetails) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to proceed with the withdrawal.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > availableBalance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your available balance.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          amount: numAmount,
          payment_method: paymentMethod,
          payment_details: { details: paymentDetails },
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your withdrawal request has been submitted.",
      });

      // Reset form
      setAmount("");
      setPaymentMethod("");
      setPaymentDetails("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Withdrawals</h2>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="text-2xl font-bold">R${availableBalance.toFixed(2)}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount to Withdraw</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                max={availableBalance}
                step="0.01"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Payment Details</label>
              <Input
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                placeholder="Enter payment details"
              />
            </div>

            <Button 
              onClick={handleWithdrawalRequest} 
              disabled={isSubmitting || !amount || !paymentMethod || !paymentDetails}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                "Request Withdrawal"
              )}
            </Button>
          </div>
        </div>
      </Card>

      {withdrawalHistory && withdrawalHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>
          <div className="space-y-4">
            {withdrawalHistory.map((withdrawal) => (
              <div key={withdrawal.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">R${withdrawal.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(withdrawal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                  withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WithdrawalSection;