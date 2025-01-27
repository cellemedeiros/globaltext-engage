import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Globe, Rocket, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationsList from "@/components/dashboard/TranslationsList";
import MRRMetrics from "@/components/dashboard/MRRMetrics";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

const AIDashboard = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <div className="flex justify-between items-center">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-white flex items-center gap-2"
            >
              <Brain className="w-8 h-8 text-emerald-400" />
              AI Translation Hub
            </motion.h1>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/settings')}
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <NotificationsPopover />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gray-800 border-gray-700 hover:border-emerald-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Globe className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Active Projects</h3>
                  <p className="text-gray-400">Manage your translations</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Models</h3>
                  <p className="text-gray-400">Configure translation models</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Rocket className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">API Access</h3>
                  <p className="text-gray-400">Manage your API keys</p>
                </div>
              </div>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gray-800 border-gray-700">
              <ScrollArea className="h-[600px]">
                <TranslationsList role="client" />
              </ScrollArea>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIDashboard;