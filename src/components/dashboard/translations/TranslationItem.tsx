import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TranslationStatus from "./TranslationStatus";
import TranslationContent from "./TranslationContent";
import TranslationActions from "./TranslationActions";
import TranslationHeader from "./TranslationHeader";
import TranslationEarnings from "./TranslationEarnings";
import TranslationDownload from "./TranslationDownload";
import { Card } from "@/components/ui/card";

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
}

interface TranslationItemProps {
  translation: Translation;
  role?: 'client' | 'translator' | 'admin';
  onUpdate: () => void;
}

const TranslationItem = ({ translation, role, onUpdate }: TranslationItemProps) => {
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

  const handleAdminReview = async (status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({
          admin_review_status: status,
          admin_review_notes: reviewNotes,
          admin_reviewed_at: new Date().toISOString()
        })
        .eq('id', translation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Translation ${status} successfully`,
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating admin review:', error);
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <TranslationHeader
            documentName={translation.document_name}
            createdAt={translation.created_at}
            sourceLanguage={translation.source_language}
            targetLanguage={translation.target_language}
            deadline={translation.deadline}
          />
          <div className="flex items-center gap-2">
            {translation.file_path && (role === 'translator' || role === 'admin') && (
              <TranslationDownload 
                filePath={translation.file_path}
                documentName={translation.document_name}
              />
            )}
            <TranslationStatus 
              status={translation.status}
              wordCount={translation.word_count}
              adminReviewStatus={translation.admin_review_status}
            />
          </div>
        </div>

        {role === 'translator' && (
          <TranslationEarnings wordCount={translation.word_count} />
        )}

        {(role === 'translator' || role === 'admin') && (
          <div className="space-y-6 border-t pt-4 mt-4">
            <TranslationContent 
              content={translation.content}
              aiTranslatedContent={translation.ai_translated_content}
              title={translation.document_name}
            />
            
            {role === 'translator' && (
              <TranslationActions
                translationId={translation.id}
                status={translation.status}
                onUpdate={onUpdate}
              />
            )}

            {role === 'admin' && translation.status === 'pending_admin_review' && (
              <div className="space-y-4 border-t pt-4">
                <textarea
                  className="w-full min-h-[100px] p-4 rounded-lg border resize-y focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Add review notes (optional)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleAdminReview('approved')}
                    className="flex-1"
                    variant="default"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleAdminReview('rejected')}
                    className="flex-1"
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TranslationItem;