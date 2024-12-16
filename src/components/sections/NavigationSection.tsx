import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog, { AuthButton } from "../auth/AuthDialog";
import FreelancerApplicationDialog from "./FreelancerApplicationDialog";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const NavigationSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { t } = useTranslation();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
    },
    enabled: isAuthenticated === true,
    retry: false
  });

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear any remaining auth data from localStorage
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      }
      
      setIsAuthenticated(false);
      
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      });

      window.location.href = "/";
    } catch (error) {
      console.error('Error in logout process:', error);
      setIsAuthenticated(false);
      localStorage.clear();
      window.location.href = "/";
    }
  }, [toast]);

  const handleDashboardClick = useCallback(() => {
    if (profile?.role === 'translator') {
      navigate("/translator-dashboard");
    } else {
      navigate("/dashboard");
    }
  }, [navigate, profile?.role]);

  if (isAuthenticated === null) {
    return null;
  }

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
                onClick={handleDashboardClick}
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