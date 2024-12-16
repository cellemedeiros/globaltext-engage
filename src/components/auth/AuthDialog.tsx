import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RoleSelection from "./RoleSelection";
import AuthForm from "./AuthForm";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const AuthDialog = ({ isOpen, onOpenChange, message }: AuthDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'translator' | null>(null);
  const { toast } = useToast();

  const handleRoleSelect = async (role: 'client' | 'translator') => {
    setSelectedRole(role);
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (!existingProfile) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: session.user.id,
                role: role
              }]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              toast({
                title: "Error",
                description: "There was a problem setting up your profile. Please try again.",
                variant: "destructive",
              });
            }
          } else {
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6">
        {!selectedRole ? (
          <RoleSelection onRoleSelect={handleRoleSelect} />
        ) : (
          <AuthForm 
            selectedRole={selectedRole}
            onRoleChange={() => setSelectedRole(null)}
            message={message}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export const AuthButton = ({ onClick }: { onClick: () => void }) => (
  <Button 
    variant="outline" 
    size="sm" 
    onClick={onClick} 
    className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light"
  >
    <LogIn className="w-4 h-4" />
    Sign In / Sign Up
  </Button>
);

export default AuthDialog;