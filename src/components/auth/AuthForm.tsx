import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AuthFormProps {
  selectedRole: 'client' | 'translator';
  onRoleChange: () => void;
  message?: string;
}

const AuthForm = ({ selectedRole, onRoleChange, message }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      setIsLoading(true);
      try {
        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_approved_translator')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Update profile with selected role if it's a new user
        if (!profile.role || profile.role === 'client') {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: selectedRole })
            .eq('id', session.user.id);

          if (updateError) throw updateError;
        }

        // Redirect based on role
        if (profile.role === 'translator' || selectedRole === 'translator') {
          if (profile.is_approved_translator) {
            navigate('/translator-dashboard');
          } else {
            navigate('/?apply=true');
          }
        } else {
          navigate('/dashboard');
        }

        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
      } catch (error) {
        console.error('Error during post-login:', error);
        toast({
          title: "Error",
          description: "There was a problem setting up your account. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRoleChange}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Sign in as {selectedRole}
        </h2>
      </div>

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}

      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="light"
        providers={[]}
        redirectTo={window.location.origin}
      />

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground">
          Setting up your account...
        </div>
      )}
    </div>
  );
};

export default AuthForm;