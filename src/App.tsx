import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import TranslatorDashboard from "./pages/TranslatorDashboard";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'client' | 'translator' | 'admin' }) => {
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
        
        if (error.message?.includes('refresh_token_not_found') || 
            error.error?.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          toast({
            title: "Session Expired",
            description: "Please sign in again.",
            variant: "destructive"
          });
          return null;
        }

        toast({
          title: "Authentication Error",
          description: "Please try logging in again.",
          variant: "destructive"
        });
        await supabase.auth.signOut();
        setIsAuthenticated(false);
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
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="client">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/translator-dashboard"
        element={
          <ProtectedRoute allowedRole="translator">
            <TranslatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRole="admin">
            <TranslatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute allowedRole="client">
            <Payment />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppRoutes />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;