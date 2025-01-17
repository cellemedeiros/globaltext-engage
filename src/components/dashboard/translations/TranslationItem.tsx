import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TranslationStatus from "./TranslationStatus";
import TranslationContent from "./TranslationContent";
import TranslationActions from "./TranslationActions";
import TranslationHeader from "./TranslationHeader";
import TranslationEarnings from "./TranslationEarnings";
import AdminReviewSection from "./AdminReviewSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Translation {
  id: string;
  document_name: string;
  source_language: string;
  target_language: string;
  status: string;
  created_at: string;
  word_count: number;
  ai_translated_content?: string;
  translator_review?: string;
  content?: string;
  admin_review_status?: string;
  admin_review_notes?: string;
  deadline?: string;
  translator_id?: string;
  file_path?: string;
  translated_file_path?: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    id: string;
  };
}

interface TranslationItemProps {
  translation: Translation;
  role?: 'client' | 'translator' | 'admin';
  onUpdate: () => void;
}

const TranslationItem = ({ translation, role = 'client', onUpdate }: TranslationItemProps) => {
  const { toast } = useToast();

  const handleAcceptTranslation = async () => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({
          translator_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'in_progress'
        })
        .eq('id', translation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation accepted successfully",
      });
      onUpdate();
    } catch (error) {
      console.error('Error accepting translation:', error);
      toast({
        title: "Error",
        description: "Failed to accept translation",
        variant: "destructive"
      });
    }
  };

  const handleDeclineTranslation = async () => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({
          status: 'declined'
        })
        .eq('id', translation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation declined successfully",
      });
      onUpdate();
    } catch (error) {
      console.error('Error declining translation:', error);
      toast({
        title: "Error",
        description: "Failed to decline translation",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <TranslationHeader
              documentName={translation.document_name}
              createdAt={translation.created_at}
              sourceLanguage={translation.source_language}
              targetLanguage={translation.target_language}
              deadline={translation.deadline}
            />
            {role === 'admin' && translation.profiles && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  Client: {translation.profiles.first_name} {translation.profiles.last_name}
                </Badge>
              </div>
            )}
          </div>
          <TranslationStatus 
            status={translation.status}
            wordCount={translation.word_count}
            adminReviewStatus={translation.admin_review_status}
          />
        </div>

        {role === 'translator' && (
          <TranslationEarnings wordCount={translation.word_count} />
        )}

        <TranslationContent 
          content={translation.content}
          aiTranslatedContent={translation.ai_translated_content}
          title={translation.document_name}
          documentName={translation.document_name}
          filePath={translation.file_path}
          translatedFilePath={translation.translated_file_path}
          role={role}
          sourceLanguage={translation.source_language}
          targetLanguage={translation.target_language}
        />
        
        {role === 'translator' && (
          <TranslationActions
            translationId={translation.id}
            status={translation.status}
            onUpdate={onUpdate}
            onAccept={handleAcceptTranslation}
            onDecline={handleDeclineTranslation}
          />
        )}

        {role === 'admin' && translation.status === 'pending_admin_review' && (
          <AdminReviewSection
            translationId={translation.id}
            onUpdate={onUpdate}
          />
        )}
      </div>
    </Card>
  );
};

export default TranslationItem;