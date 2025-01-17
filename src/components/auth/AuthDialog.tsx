import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import RoleSelection from "./RoleSelection";
import AuthForm from "./AuthForm";
import { useAuthState } from "@/hooks/useAuthState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const AuthDialog = ({ isOpen, onOpenChange, message }: AuthDialogProps) => {
  const { selectedRole, setSelectedRole, handleRoleSelect } = useAuthState(onOpenChange);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        onOpenChange(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] p-0">
        <ScrollArea className="h-full max-h-[80vh] p-6">
          {!selectedRole ? (
            <RoleSelection onRoleSelect={handleRoleSelect} />
          ) : (
            <AuthForm 
              selectedRole={selectedRole}
              onRoleChange={() => setSelectedRole(null)}
              message={message}
            />
          )}
        </ScrollArea>
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