import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PendingApplicationMessage from "./PendingApplicationMessage";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface TranslatorAccessControlProps {
  children: React.ReactNode;
}

const TranslatorAccessControl = ({ children }: TranslatorAccessControlProps) => {
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    }
  });

  const { data: application, isLoading: applicationLoading } = useQuery({
    queryKey: ['translator-application'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
    enabled: !!profile
  });

  useEffect(() => {
    if (!profileLoading && (!profile || profile.role !== 'translator')) {
      toast({
        title: "Access Denied",
        description: "You must be a translator to access this page.",
        variant: "destructive"
      });
    }
  }, [profile, profileLoading, toast]);

  if (profileLoading || applicationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== 'translator') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!profile.is_approved_translator && !application) {
    toast({
      title: "Application Required",
      description: "You need to apply as a translator first.",
    });
    return <Navigate to="/?apply=true" />;
  }

  if (!profile.is_approved_translator && application) {
    return <PendingApplicationMessage />;
  }

  return <>{children}</>;
};

export default TranslatorAccessControl;