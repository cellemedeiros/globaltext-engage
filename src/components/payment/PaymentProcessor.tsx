import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentProcessorProps {
  amount: string | null;
  words: string | null;
  plan: string | null;
  session: Session | null;
}

const PaymentProcessor = ({ amount, words, plan, session }: PaymentProcessorProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const createTranslationFromPending = async () => {
    const pendingTranslation = localStorage.getItem('pendingTranslation');
    if (!pendingTranslation || !session) return;

    const { fileName, fileContent, wordCount } = JSON.parse(pendingTranslation);

    try {
      const { data: translation, error: insertError } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: fileName,
          content: fileContent,
          word_count: wordCount,
          status: 'pending',
          amount_paid: amount ? parseFloat(amount) : 0,
          source_language: 'en',
          target_language: 'pt',
          price_offered: amount ? parseFloat(amount) * 0.7 : 0,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Notify translators
      const { data: translators, error: translatorsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'translator')
        .eq('is_approved_translator', true);

      if (translatorsError) throw translatorsError;

      if (translators?.length) {
        const notifications = translators.map(translator => ({
          user_id: translator.id,
          title: 'New Translation Available',
          message: `A new translation project "${fileName}" is available for claiming.`,
          read: false
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) throw notificationError;
      }

      // Clear pending translation
      localStorage.removeItem('pendingTranslation');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      queryClient.invalidateQueries({ queryKey: ['available-translations'] });

    } catch (error) {
      console.error('Error creating translation:', error);
      toast({
        title: "Error",
        description: "Failed to create translation. Please contact support.",
        variant: "destructive"
      });
    }
  };

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
        body: { amount, words, plan },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Create translation before redirecting to payment
        await createTranslationFromPending();
        
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

  return (
    <div className="p-6">
      <Button 
        onClick={handlePayment}
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : `Proceed to Payment - R$${amount}`}
      </Button>
    </div>
  );
};

export default PaymentProcessor;