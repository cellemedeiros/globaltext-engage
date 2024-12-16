import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AuthDialog, { AuthButton } from "../auth/AuthDialog";
import FreelancerApplicationDialog from "./FreelancerApplicationDialog";
import { useEffect, useState } from "react";
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

  const handleLogout = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setIsAuthenticated(false);
        navigate("/");
        return;
      }

      if (!session) {
        setIsAuthenticated(false);
        navigate("/");
        toast({
          title: "Already signed out",
          description: "You were already signed out of your account.",
        });
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Error",
          description: "There was a problem signing out. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsAuthenticated(false);
      
      // Clear any cached data
      window.location.href = "/";
      
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Error in logout process:', error);
      toast({
        title: "Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDashboardClick = () => {
    if (profile?.role === 'translator') {
      navigate("/translator-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

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