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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          queryClient.clear();
          await supabase.auth.signOut();
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
        queryClient.clear();
        await supabase.auth.signOut();
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
        toast({
          title: "Signed Out",
          description: "Your session has ended. Please sign in again to continue.",
        });
      } else if (event === 'SIGNED_IN' && session) {
        await checkSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/?signin=true" />;
  }

  if (allowedRole === 'admin' && profile.id !== '37665cdd-1fdd-40d0-b485-35148c159bed') {
    return <Navigate to="/" />;
  }

  if (allowedRole !== 'admin' && profile.role !== allowedRole) {
    return <Navigate to={profile.role === 'translator' ? '/translator-dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;