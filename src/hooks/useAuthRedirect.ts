import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, QueryClient } from "@tanstack/react-query";

export const useAuthRedirect = (queryClient: QueryClient) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Function to handle session errors
  const handleSessionError = async () => {
    setIsAuthenticated(false);
    queryClient.clear();
    await supabase.auth.signOut();
    toast({
      title: "Session Expired",
      description: "Please sign in again to continue.",
      variant: "destructive"
    });
  };

  // Initial session check and auth state listener
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          if (mounted) {
            await handleSessionError();
          }
        } else if (mounted) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          await handleSessionError();
        }
      }
    };

    // Initial check
    checkSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          await checkSession(); // Verify session is valid
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          queryClient.clear();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await handleSessionError();
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
      } catch (error) {
        console.error('Error in profile query:', error);
        await handleSessionError();
        return null;
      }
    },
    enabled: isAuthenticated === true,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false
  });

  return { isAuthenticated, profile, isLoading };
};