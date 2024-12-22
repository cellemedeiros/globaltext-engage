import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import TranslatorDashboard from "./pages/TranslatorDashboard";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'client' | 'translator' | 'admin' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (sessionError.message.includes('session_not_found')) {
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            toast({
              title: "Session Expired",
              description: "Please sign in again.",
              variant: "destructive"
            });
            return null;
          }
          throw sessionError;
        }
        
        if (!session) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: isAuthenticated === true,
    retry: false
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes('session_not_found')) {
            await supabase.auth.signOut();
            toast({
              title: "Session Expired",
              description: "Please sign in again.",
              variant: "destructive"
            });
          }
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Session check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        queryClient.clear();
      } else {
        setIsAuthenticated(!!session);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  if (isAuthenticated === null || isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRole === 'admin' && profile?.id !== '37665cdd-1fdd-40d0-b485-35148c159bed') {
    return <Navigate to="/" />;
  }

  if (allowedRole !== 'admin' && profile?.role !== allowedRole) {
    return <Navigate to={profile?.role === 'translator' ? '/translator-dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;