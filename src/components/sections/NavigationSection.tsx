import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from "@/components/auth/AuthDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import FreelancerApplicationDialog from "./FreelancerApplicationDialog";
import { ArrowLeft, Globe, LogOut } from "lucide-react";

const NavigationSection = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Handle session_not_found error specifically
      if (error?.message?.includes('session_not_found')) {
        // If session is not found, we can consider the user already logged out
        setIsAuthenticated(false);
        navigate("/");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
        return;
      }

      if (error) throw error;

      navigate("/");
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force client-side logout even if server-side logout failed
      setIsAuthenticated(false);
      navigate("/");
      toast({
        title: "Notice",
        description: "You have been signed out.",
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showBackButton = window.location.pathname !== "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {showBackButton && (
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <Globe className="w-6 h-6 text-primary" />
              GlobalText AI
            </a>
            
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => scrollToSection("features")}
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                {t('nav.features')}
              </button>
              <button 
                onClick={() => scrollToSection("pricing")}
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                {t('nav.pricing')}
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                {t('nav.contact')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FreelancerApplicationDialog />
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button onClick={() => navigate("/dashboard")}>
                  {t('nav.dashboard')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)}>Sign In / Sign Up</Button>
            )}
          </div>
        </div>
      </div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </nav>
  );
};

export default NavigationSection;