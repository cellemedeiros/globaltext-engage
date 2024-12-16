import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog, { AuthButton } from "../auth/AuthDialog";
import FreelancerApplicationDialog from "./FreelancerApplicationDialog";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";

const NavigationSection = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { t } = useTranslation();

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
        <div className="flex items-center gap-2 group">
          <Globe className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">GlobalText</span>
            <span className="text-xs text-gray-500 ml-1 hidden sm:inline">AI</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-sm">
            {!isAuthenticated && (
              <>
                <a href="#features" className="hover:text-primary transition-colors">{t('nav.features')}</a>
                <a href="#pricing" className="hover:text-primary transition-colors">{t('nav.pricing')}</a>
                <a href="#contact" className="hover:text-primary transition-colors">{t('nav.contact')}</a>
              </>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="hover:text-primary transition-colors"
              >
                {t('nav.dashboard')}
              </Button>
            )}
          </div>
          <LanguageSwitcher />
          <FreelancerApplicationDialog />
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('nav.logout')}
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