import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthState = (onOpenChange: (open: boolean) => void) => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'translator' | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTranslatorAccess = async (session: any) => {
    const { data: application } = await supabase
      .from('freelancer_applications')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();

    if (!application) {
      onOpenChange(false);
      navigate('/?apply=true');
      toast({
        title: "Application Required",
        description: "You need to apply as a translator first.",
      });
      return true;
    } else {
      onOpenChange(false);
      navigate('/translator-dashboard');
      return true;
    }
  };

  const handleProfileUpdate = async (session: any, role: 'client' | 'translator') => {
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
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          id: session.user.id,
          role: role
        }]);

      if (insertError) throw insertError;
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', session.user.id);

      if (updateError) throw updateError;
    }

    window.location.href = role === 'translator' ? '/translator-dashboard' : '/dashboard';
  };

  const handleRoleSelect = async (role: 'client' | 'translator') => {
    setSelectedRole(role);
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          await handleProfileUpdate(session, role);
        } catch (error) {
          console.error('Error in profile setup:', error);
          toast({
            title: "Error",
            description: "There was a problem setting up your profile. Please try again.",
            variant: "destructive",
          });
        }
      }
    });
  };

  return {
    selectedRole,
    setSelectedRole,
    handleRoleSelect
  };
};