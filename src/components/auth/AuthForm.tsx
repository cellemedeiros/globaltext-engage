import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface AuthFormProps {
  selectedRole: 'client' | 'translator';
  onRoleChange: () => void;
  message?: string;
}

const AuthForm = ({ selectedRole, onRoleChange, message }: AuthFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
  });
  const { toast } = useToast();

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            country: formData.country,
            phone: formData.phone,
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const appearance = {
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: '#1EAEDB',
          brandAccent: '#33C3F0',
          inputBackground: 'white',
          inputBorder: 'hsl(var(--border))',
          inputBorderFocus: '#1EAEDB',
          inputBorderHover: '#1EAEDB',
          inputPlaceholder: 'hsl(var(--muted-foreground))',
        },
        space: {
          inputPadding: '0.75rem',
          buttonPadding: '0.75rem',
        },
        borderWidths: {
          buttonBorderWidth: '1px',
          inputBorderWidth: '1px',
        },
        radii: {
          borderRadiusButton: '0.5rem',
          buttonBorderRadius: '0.5rem',
          inputBorderRadius: '0.5rem',
        },
        fonts: {
          bodyFontFamily: 'Inter, sans-serif',
          buttonFontFamily: 'Inter, sans-serif',
          inputFontFamily: 'Inter, sans-serif',
          labelFontFamily: 'Inter, sans-serif',
        },
      },
    },
    className: {
      container: 'flex flex-col gap-3',
      button: 'w-full bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors',
      label: 'block text-sm font-medium text-foreground mb-1',
      input: 'w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      divider: 'my-3 text-xs text-muted-foreground',
      message: 'text-sm text-foreground/80 mb-3',
      anchor: 'text-primary hover:text-primary-light transition-colors',
      auth_button: 'w-full bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors',
      auth_button_container: 'flex flex-col gap-2',
    },
  };

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
        <form onSubmit={handleSignUp} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" className="w-full">Sign Up</Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className="text-primary hover:text-primary-light"
            >
              Sign in
            </button>
          </p>
        </form>
      ) : (
        <>
          <Auth
            supabaseClient={supabase}
            appearance={appearance}
            theme="light"
            providers={["google"]}
            redirectTo={window.location.origin}
            view="sign_in"
            showLinks={false}
          />
          <p className="text-center text-sm text-muted-foreground mt-3">
            Don't have an account?{" "}
            <button
              onClick={() => setIsSignUp(true)}
              className="text-primary hover:text-primary-light"
            >
              Sign up
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default AuthForm;