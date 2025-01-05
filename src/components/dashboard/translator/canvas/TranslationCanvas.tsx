import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import TranslationForm from "./TranslationForm";

interface TranslationCanvasProps {
  translationId?: string;
}

const TranslationCanvas = ({ translationId }: TranslationCanvasProps) => {
  const { data: translation, isLoading } = useQuery({
    queryKey: ['translation', translationId],
    queryFn: async () => {
      if (!translationId) return null;
      
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('id', translationId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!translationId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 bg-gray-50 p-6 rounded-lg"
    >
      <TranslationForm
        translationId={translationId}
        initialData={translation}
      />
    </motion.div>
  );
};

export default TranslationCanvas;