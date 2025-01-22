import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthFormProps {
  selectedRole: 'client' | 'translator';
  onRoleChange: () => void;
  message?: string;
}

const AuthForm = ({ selectedRole, onRoleChange, message }: AuthFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // Get user profile to check role
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, is_approved_translator')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;

          // Redirect based on role
          if (profile.role === 'translator') {
            if (!profile.is_approved_translator) {
              navigate('/?apply=true');
              toast({
                title: "Application Required",
                description: "Please complete your translator application.",
              });
            } else {
              navigate('/translator-dashboard');
            }
          } else {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          toast({
            title: "Error",
            description: "There was a problem accessing your profile.",
            variant: "destructive",
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground mb-2">
          {isSignUp ? 'Sign up' : 'Sign in'} as {selectedRole === 'client' ? 'Client' : 'Translator'}
        </h2>
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
        <button 
          onClick={onRoleChange}
          className="text-sm text-primary hover:text-primary-light mt-2"
        >
          Change role
        </button>
      </div>

      {isSignUp ? (
        <SignUpForm onToggleForm={() => setIsSignUp(false)} />
      ) : (
        <SignInForm onToggleForm={() => setIsSignUp(true)} />
      )}
    </div>
  );
};

export default AuthForm;