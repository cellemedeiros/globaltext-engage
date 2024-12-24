import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  isAuthenticated: boolean | null;
  userRole: 'client' | 'translator' | 'admin' | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  userRole: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'translator' | 'admin' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          await handleSignOut();
          return;
        }

        if (mounted) {
          setIsAuthenticated(!!session);
          if (session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            setUserRole(profile?.role || null);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          handleSignOut();
        }
      }
    };

    const handleSignOut = async () => {
      if (mounted) {
        setIsAuthenticated(false);
        setUserRole(null);
        queryClient.clear();
        await supabase.auth.signOut();
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      
      if (event === 'SIGNED_OUT') {
        await handleSignOut();
      } else if (event === 'TOKEN_REFRESHED') {
        if (!session) {
          await handleSignOut();
        } else if (mounted) {
          setIsAuthenticated(true);
        }
      } else if (event === 'SIGNED_IN' && mounted) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUserRole(profile?.role || null);
      }
    });

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};