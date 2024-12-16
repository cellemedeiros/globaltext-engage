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
          brand: 'hsl(var(--primary))',
          brandAccent: 'hsl(var(--primary))',
          inputBackground: 'white',
          inputBorder: 'hsl(var(--border))',
          inputBorderFocus: 'hsl(var(--primary))',
          inputBorderHover: 'hsl(var(--primary))',
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
          bodyFontFamily: `var(--font-sans)`,
          buttonFontFamily: `var(--font-sans)`,
          inputFontFamily: `var(--font-sans)`,
          labelFontFamily: `var(--font-sans)`,
        },
      },
    },
    className: {
      container: 'w-full',
      button: 'w-full rounded-lg font-medium transition-colors bg-primary text-white hover:bg-primary/90 py-2 px-4 mb-2',
      label: 'text-sm font-medium text-foreground',
      input: 'rounded-lg border bg-background px-4 py-3 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      divider: 'my-4 text-xs text-muted-foreground',
      message: 'text-sm text-foreground/80 mb-4',
      anchor: 'text-primary hover:text-primary/80 transition-colors',
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
          showLinks={true}
          view="sign_in"
        />
      </DialogContent>
    </Dialog>
  );
};

export const AuthButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="outline" size="sm" onClick={onClick} className="flex items-center gap-2">
    <LogIn className="w-4 h-4" />
    Sign In / Sign Up
  </Button>
);

export default AuthDialog;