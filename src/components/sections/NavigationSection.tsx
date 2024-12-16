import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog, { AuthButton } from "../auth/AuthDialog";
import FreelancerApplicationDialog from "./FreelancerApplicationDialog";
import { useEffect, useState } from "react";

const NavigationSection = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setShowAuthDialog(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary animate-pulse" />
          <div className="text-xl font-bold">
            <span className="text-primary">GT</span>
            <span className="text-gray-700 text-sm ml-1">translate</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm">
            {!isAuthenticated && (
              <>
                <a href="#features" className="hover:text-primary transition-colors">Features</a>
                <a href="#languages" className="hover:text-primary transition-colors">Languages</a>
                <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
                <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
              </>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="hover:text-primary transition-colors"
              >
                Dashboard
              </Button>
            )}
          </div>
          <FreelancerApplicationDialog />
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          ) : (
            <AuthButton onClick={() => setShowAuthDialog(true)} />
          )}
        </div>
      </nav>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </header>
  );
};

export default NavigationSection;