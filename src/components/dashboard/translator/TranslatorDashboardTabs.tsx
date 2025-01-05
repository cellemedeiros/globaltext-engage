import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TranslationsList from "../TranslationsList";
import AvailableTranslations from "./AvailableTranslations";
import TranslationCanvas from "./TranslationCanvas";
import { motion } from "framer-motion";

interface TranslatorDashboardTabsProps {
  isLoading: boolean;
}

const TranslatorDashboardTabs = ({ isLoading }: TranslatorDashboardTabsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Tabs defaultValue="available" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
          <TabsTrigger 
            value="available"
            className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 hover:bg-primary/80"
          >
            Available Translations
          </TabsTrigger>
          <TabsTrigger 
            value="my-translations"
            className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 hover:bg-primary/80"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="canvas"
            className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 hover:bg-primary/80"
          >
            Translation Canvas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <AvailableTranslations />
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="my-translations" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <TranslationsList 
                role="translator"
                isLoading={isLoading}
              />
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="canvas" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <TranslationCanvas />
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default TranslatorDashboardTabs;