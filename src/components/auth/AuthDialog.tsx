import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const AuthDialog = ({ isOpen, onOpenChange, message }: AuthDialogProps) => {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to GlobalText</h2>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
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
      </DialogContent>
    </Dialog>
  );
};

export const AuthButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="outline" size="sm" onClick={onClick} className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light">
    <LogIn className="w-4 h-4" />
    Sign In / Sign Up
  </Button>
);

export default AuthDialog;