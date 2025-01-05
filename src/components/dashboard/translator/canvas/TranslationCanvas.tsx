import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TranslationForm from "./TranslationForm";
import TranslationCanvasLayout from "./TranslationCanvasLayout";

const TranslationCanvas = () => {
  const { translationId } = useParams();

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
      <TranslationCanvasLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </TranslationCanvasLayout>
    );
  }

  return (
    <TranslationCanvasLayout>
      <TranslationForm
        translationId={translationId}
        initialData={translation}
      />
    </TranslationCanvasLayout>
  );
};

export default TranslationCanvas;