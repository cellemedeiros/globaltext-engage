import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePaymentAuth } from "@/hooks/usePaymentAuth";
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentProcessor from "@/components/payment/PaymentProcessor";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const { session, isCheckingAuth } = usePaymentAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const words = searchParams.get('words');
  const amount = searchParams.get('amount');
  const documentName = searchParams.get('documentName');
  const filePath = searchParams.get('filePath');
  const sourceLanguage = searchParams.get('sourceLanguage');
  const targetLanguage = searchParams.get('targetLanguage');
  const content = searchParams.get('content');

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (session?.user?.email === 'bispomathews@gmail.com') {
        toast({
          title: "Admin Access",
          description: "Redirecting to translator dashboard",
        });
        navigate('/translator-dashboard');
        return;
      }
    };

    checkAdminAccess();
  }, [session, navigate, toast]);

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

  if (isCheckingAuth || isLoadingProfile) {
    return <div>Loading...</div>;
  }

  if (session?.user?.email === 'bispomathews@gmail.com') {
    return null; // Return null while redirecting
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
          words={words}
          documentName={documentName}
          session={session}
          filePath={filePath}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          content={content}
        />
      </div>
    </div>
  );
};

export default Payment;