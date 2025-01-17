import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PendingApplicationMessage from "./PendingApplicationMessage";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface TranslatorAccessControlProps {
  children: React.ReactNode;
}

const TranslatorAccessControl = ({ children }: TranslatorAccessControlProps) => {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // First, ensure we have a valid session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try logging in again.",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!session?.user?.id,
  });

  const { data: application, isLoading: applicationLoading } = useQuery({
    queryKey: ['translator-application', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;

      try {
        const { data, error } = await supabase
          .from('freelancer_applications')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
      } catch (error) {
        console.error('Error fetching application:', error);
        return null;
      }
    },
    enabled: !!session?.user?.email && !!profile,
  });

  // Show loading state while checking authentication
  if (isLoading || profileLoading || applicationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no session
  if (!session) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access the translator dashboard.",
      variant: "destructive",
    });
    return <Navigate to="/?signin=true" replace />;
  }

  // Check if user is a translator
  if (!profile || profile.role !== 'translator') {
    toast({
      title: "Access Denied",
      description: "You must be a translator to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Check if application is needed
  if (!profile.is_approved_translator && !application) {
    toast({
      title: "Application Required",
      description: "You need to apply as a translator first.",
    });
    return <Navigate to="/?apply=true" replace />;
  }

  // Show pending application message
  if (!profile.is_approved_translator && application) {
    return <PendingApplicationMessage />;
  }

  return <>{children}</>;
};

export default TranslatorAccessControl;