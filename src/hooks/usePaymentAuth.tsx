import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const usePaymentAuth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: session, isLoading: isCheckingAuth } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

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

  return { session, isCheckingAuth };
};