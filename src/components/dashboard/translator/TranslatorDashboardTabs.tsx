import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TranslationsList from "../TranslationsList";
import AvailableTranslations from "./AvailableTranslations";
import { Database } from "@/integrations/supabase/types";

type Translation = Database['public']['Tables']['translations']['Row'];

interface TranslatorDashboardTabsProps {
  translations: Translation[];
  isLoading: boolean;
}

const TranslatorDashboardTabs = ({ translations, isLoading }: TranslatorDashboardTabsProps) => {
  return (
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
            translations={translations} 
            role="translator"
            isLoading={isLoading}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TranslatorDashboardTabs;