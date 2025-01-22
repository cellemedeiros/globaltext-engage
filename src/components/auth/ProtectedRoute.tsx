import { Navigate } from "react-router-dom";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { QueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'client' | 'translator' | 'admin';
  queryClient: QueryClient;
}

const ProtectedRoute = ({ children, allowedRole, queryClient }: ProtectedRouteProps) => {
  const { toast } = useToast();
  const { isAuthenticated, profile, isLoading } = useAuthRedirect(queryClient);

  // Add session check on mount and setup auth state listener
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error('Session check error:', error);
        queryClient.clear();
        supabase.auth.signOut(); // Force sign out to clear any invalid session state
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive"
        });
      }
    };

    // Initial session check
    checkSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
        toast({
          title: "Signed Out",
          description: "Your session has ended. Please sign in again to continue.",
        });
      } else if (event === 'SIGNED_IN') {
        // Refresh the session when signed in
        await checkSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);

  if (isAuthenticated === null || isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/?signin=true" />;
  }

  if (allowedRole === 'admin' && profile?.id !== '37665cdd-1fdd-40d0-b485-35148c159bed') {
    return <Navigate to="/" />;
  }

  if (allowedRole !== 'admin' && profile?.role !== allowedRole) {
    return <Navigate to={profile?.role === 'translator' ? '/translator-dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;