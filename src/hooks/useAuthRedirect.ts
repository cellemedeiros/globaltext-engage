import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, QueryClient } from "@tanstack/react-query";

export const useAuthRedirect = (queryClient: QueryClient) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        if (!session) {
          setIsAuthenticated(false);
          return null;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }
        
        return data;
      } catch (error: any) {
        console.error('Error in profile query:', error);
        // Handle refresh token errors specifically
        if (error.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          queryClient.clear();
          toast({
            title: "Session Expired",
            description: "Please sign in again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Authentication Error",
            description: "Please try logging in again.",
            variant: "destructive"
          });
        }
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        queryClient.clear();
        return null;
      }
    },
    enabled: isAuthenticated === true,
    retry: false
  });

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Initial session check error:', error);
          if (mounted) {
            setIsAuthenticated(false);
            queryClient.clear();
          }
          return;
        }
        if (mounted) {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
          queryClient.clear();
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session);
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          queryClient.clear();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return { isAuthenticated, profile, isLoading };
};