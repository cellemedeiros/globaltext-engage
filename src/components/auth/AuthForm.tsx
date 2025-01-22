import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { useToast } from "@/components/ui/use-toast";

interface AuthFormProps {
  selectedRole: 'client' | 'translator';
  onRoleChange: () => void;
  message?: string;
}

const AuthForm = ({ selectedRole, onRoleChange, message }: AuthFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

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