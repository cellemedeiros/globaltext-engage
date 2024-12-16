import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const AuthDialog = ({ isOpen, onOpenChange, message }: AuthDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'translator' | null>(null);
  const { toast } = useToast();

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

  const handleRoleSelect = async (role: 'client' | 'translator') => {
    setSelectedRole(role);
    
    // Set up auth state change listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // First check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (!existingProfile) {
            // Create profile if it doesn't exist
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                { 
                  id: session.user.id,
                  role: role
                }
              ]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              toast({
                title: "Error",
                description: "There was a problem setting up your profile. Please try again.",
                variant: "destructive",
              });
            }
          } else {
            // Update existing profile with selected role
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: role })
              .eq('id', session.user.id);

            if (updateError) {
              console.error('Error updating profile:', updateError);
              toast({
                title: "Error",
                description: "There was a problem updating your profile. Please try again.",
                variant: "destructive",
              });
            }
          }
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

  if (!selectedRole) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to GlobalText</h2>
            <p className="text-sm text-muted-foreground">Choose how you want to use GlobalText</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleRoleSelect('client')}
            >
              <div className="text-center">
                <h3 className="font-semibold mb-2">Client</h3>
                <p className="text-sm text-muted-foreground">Get your content translated</p>
              </div>
            </Card>
            <Card 
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleRoleSelect('translator')}
            >
              <div className="text-center">
                <h3 className="font-semibold mb-2">Translator</h3>
                <p className="text-sm text-muted-foreground">Work as a translator</p>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sign in as {selectedRole === 'client' ? 'Client' : 'Translator'}
          </h2>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
          <button 
            onClick={() => setSelectedRole(null)}
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