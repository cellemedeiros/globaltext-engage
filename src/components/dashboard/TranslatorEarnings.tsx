import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, FileText, Wallet } from "lucide-react";
import WithdrawalRequestForm from "./translator/WithdrawalRequestForm";

const RATE_PER_WORD = 0.08; // R$0.08 per word

const TranslatorEarnings = () => {
  const { data: translations, refetch: refetchTranslations } = useQuery({
    queryKey: ['translator-translations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('status', 'completed')
        .eq('translator_id', user.id);

      if (error) {
        console.error('Error fetching translations:', error);
        throw error;
      }
      return data || [];
    },
  });

  const { data: availableBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['translator-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase.rpc(
        'calculate_translator_balance',
        { translator_uuid: user.id }
      );

      if (error) {
        console.error('Error calculating balance:', error);
        throw error;
      }
      return data || 0;
    },
  });

  const totalWords = translations?.reduce((sum, t) => sum + (t.word_count || 0), 0) || 0;
  const totalEarnings = totalWords * RATE_PER_WORD;
  const completedTranslations = translations?.length || 0;
  
  // Ensure available balance never exceeds total earnings
  const displayBalance = Math.min(Number(availableBalance || 0), totalEarnings);

  const handleWithdrawalSuccess = () => {
    refetchBalance();
    refetchTranslations();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Earnings Overview</h2>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <DollarSign className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">R${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Wallet className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold">R${displayBalance.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Words</p>
              <p className="text-2xl font-bold">{totalWords}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Completed Translations</p>
              <p className="text-2xl font-bold">{completedTranslations}</p>
            </div>
          </div>
        </Card>
      </div>

      <WithdrawalRequestForm 
        availableBalance={displayBalance}
        onSuccess={handleWithdrawalSuccess}
      />
    </div>
  );
};

export default TranslatorEarnings;