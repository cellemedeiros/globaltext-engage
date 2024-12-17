import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TranslatorAccessControl from "@/components/dashboard/translator/TranslatorAccessControl";
import TranslatorApprovals from "@/components/dashboard/TranslatorApprovals";
import TranslatorEarnings from "@/components/dashboard/TranslatorEarnings";
import TranslationsList from "@/components/dashboard/TranslationsList";
import AvailableTranslations from "@/components/dashboard/translator/AvailableTranslations";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ADMIN_USER_ID = "37665cdd-1fdd-40d0-b485-35148c159bed";

const TranslatorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: translations, isLoading: translationsLoading } = useQuery({
    queryKey: ['translator-translations'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('translator_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load translations. Please try again.",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.is_approved_translator
  });

  const isAdmin = profile?.id === ADMIN_USER_ID;

  return (
    <TranslatorAccessControl>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <h1 className="text-4xl font-bold text-gray-900">Translator Dashboard</h1>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <TranslatorEarnings />
              {isAdmin && <TranslatorApprovals />}
            </div>

            <Tabs defaultValue="available" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="available">Available Translations</TabsTrigger>
                <TabsTrigger value="my-translations">My Translations</TabsTrigger>
              </TabsList>
              <TabsContent value="available">
                <AvailableTranslations />
              </TabsContent>
              <TabsContent value="my-translations">
                <Card className="p-6">
                  <TranslationsList 
                    translations={translations || []} 
                    role="translator"
                    isLoading={translationsLoading}
                  />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TranslatorAccessControl>
  );
};

export default TranslatorDashboard;