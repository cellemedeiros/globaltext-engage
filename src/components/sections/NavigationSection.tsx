import { Button } from "@/components/ui/button";
import { Globe, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog from "@/components/auth/AuthDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

const NavigationSection = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/");
      toast({
        title: "Success",
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <Globe className="w-6 h-6" />
              GlobalText
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