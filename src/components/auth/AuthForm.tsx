import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

interface AuthFormProps {
  selectedRole: 'client' | 'translator';
  onRoleChange: () => void;
  message?: string;
}

const AuthForm = ({ selectedRole, onRoleChange, message }: AuthFormProps) => {
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
          inputPadding: '1rem',
          buttonPadding: '1rem',
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
      container: 'flex flex-col gap-4',
      button: 'w-full bg-primary hover:bg-primary-light text-white font-medium py-3 px-4 rounded-lg transition-colors',
      label: 'block text-sm font-medium text-foreground mb-1.5',
      input: 'w-full rounded-lg border bg-background px-4 py-3 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      divider: 'my-4 text-xs text-muted-foreground',
      message: 'text-sm text-foreground/80 mb-4',
      anchor: 'text-primary hover:text-primary-light transition-colors',
      auth_button: 'w-full bg-primary hover:bg-primary-light text-white font-medium py-3 px-4 rounded-lg transition-colors',
      auth_button_container: 'flex flex-col gap-3',
    },
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Sign in as {selectedRole === 'client' ? 'Client' : 'Translator'}
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
      <Auth
        supabaseClient={supabase}
        appearance={appearance}
        theme="light"
        providers={["google"]}
        redirectTo={window.location.origin}
        view="sign_in"
        showLinks={true}
        localization={{
          variables: {
            sign_in: {
              email_label: "Email",
              password_label: "Password",
              button_label: "Sign In",
            },
            sign_up: {
              email_label: "Email",
              password_label: "Password",
              button_label: "Sign Up",
            },
          },
        }}
      />
    </>
  );
};

export default AuthForm;