import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import RoleSelection from "./RoleSelection";
import AuthForm from "./AuthForm";
import { useAuthState } from "@/hooks/useAuthState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

const AuthDialog = ({ isOpen, onOpenChange, message }: AuthDialogProps) => {
  const { selectedRole, setSelectedRole, handleRoleSelect } = useAuthState(onOpenChange);
  const { toast } = useToast();

  // Check and handle invalid sessions
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error?.message?.includes('session_not_found')) {
          console.log('Invalid session detected, signing out...');
          await supabase.auth.signOut();
          toast({
            title: "Session Expired",
            description: "Please sign in again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    if (isOpen) {
      checkSession();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      console.log('Auth state change:', event);
      if (event === 'SIGNED_OUT') {
        setSelectedRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, toast, setSelectedRole]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] p-0">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
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