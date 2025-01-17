import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthState = (onOpenChange?: (open: boolean) => void) => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'translator' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTranslatorAccess = useCallback(async (session: any) => {
    try {
      const { data: application } = await supabase
        .from('freelancer_applications')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle();

      if (!application) {
        if (onOpenChange) onOpenChange(false);
        navigate('/?apply=true');
        toast({
          title: "Application Required",
          description: "You need to apply as a translator first.",
        });
        return true;
      } else {
        if (onOpenChange) onOpenChange(false);
        navigate('/translator-dashboard');
        return true;
      }
    } catch (error) {
      console.error('Error checking translator access:', error);
      return false;
    }
  }, [navigate, onOpenChange, toast]);

  const handleProfileUpdate = useCallback(async (session: any, role: 'client' | 'translator') => {
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, is_approved_translator')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (role === 'translator' && (!existingProfile?.is_approved_translator)) {
        return await handleTranslatorAccess(session);
      }

      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert([{ 
            id: session.user.id,
            role: role
          }]);
      } else {
        await supabase
          .from('profiles')
          .update({ role: role })
          .eq('id', session.user.id);
      }

      if (onOpenChange) onOpenChange(false);
      navigate(role === 'translator' ? '/translator-dashboard' : '/dashboard');
    } catch (error) {
      console.error('Error in profile setup:', error);
      toast({
        title: "Error",
        description: "There was a problem setting up your profile. Please try again.",
        variant: "destructive",
      });
    }
  }, [handleTranslatorAccess, navigate, onOpenChange, toast]);

  const handleRoleSelect = useCallback(async (role: 'client' | 'translator') => {
    setSelectedRole(role);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await handleProfileUpdate(session, role);
    }
  }, [handleProfileUpdate]);

  return {
    selectedRole,
    setSelectedRole,
    handleRoleSelect,
    isAuthenticated
  };
};