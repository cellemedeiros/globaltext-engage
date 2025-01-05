import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TranslationStatus from "./TranslationStatus";
import TranslationContent from "./TranslationContent";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, Languages, Clock } from "lucide-react";
import { format } from "date-fns";

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
}

interface TranslationItemProps {
  translation: Translation;
  role?: 'client' | 'translator' | 'admin';
  onUpdate: () => void;
}

const TranslationItem = ({ translation, role, onUpdate }: TranslationItemProps) => {
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

  const handleAcceptTranslation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('translations')
        .update({
          translator_id: session.user.id,
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
          translator_id: null,
          status: 'pending'
        })
        .eq('id', translation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation declined",
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

  const handleReviewSubmit = async (translationId: string, reviewedContent: string) => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({
          translator_review: reviewedContent,
          status: 'pending_admin_review',
          completed_at: new Date().toISOString()
        })
        .eq('id', translationId);

      if (error) throw error;
      onUpdate();
      
      toast({
        title: "Success",
        description: "Translation submitted for admin review",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const handleAdminReview = async (translationId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({
          admin_review_status: status,
          admin_review_notes: reviewNotes,
          status: status === 'approved' ? 'completed' : 'pending_review'
        })
        .eq('id', translationId);

      if (error) throw error;
      onUpdate();
      
      toast({
        title: "Success",
        description: `Translation ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review translation",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {translation.document_name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(translation.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Languages className="w-4 h-4" />
                {translation.source_language} → {translation.target_language}
              </div>
              {translation.deadline && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Due: {formatDate(translation.deadline)}
                </div>
              )}
            </div>
          </div>
          <TranslationStatus 
            status={translation.status}
            wordCount={translation.word_count}
            adminReviewStatus={translation.admin_review_status}
          />
        </div>

        {(role === 'translator' || role === 'admin') && (
          <div className="space-y-6 border-t pt-4 mt-4">
            <TranslationContent 
              content={translation.content}
              aiTranslatedContent={translation.ai_translated_content}
              title={translation.document_name}
            />
            
            {role === 'translator' && translation.status === 'pending' && !translation.translator_id && (
              <div className="flex gap-4">
                <Button 
                  onClick={handleAcceptTranslation}
                  className="flex-1"
                  variant="default"
                >
                  Accept Translation
                </Button>
                <Button 
                  onClick={handleDeclineTranslation}
                  className="flex-1"
                  variant="outline"
                >
                  Decline
                </Button>
              </div>
            )}

            {role === 'translator' && translation.status === 'pending_review' && (
              <div className="space-y-4">
                <textarea
                  className="w-full min-h-[200px] p-4 rounded-lg border resize-y focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Review and edit the translation..."
                  defaultValue={translation.ai_translated_content}
                />
                <Button 
                  onClick={(e) => {
                    const textarea = e.currentTarget.parentElement?.querySelector('textarea');
                    if (textarea) {
                      handleReviewSubmit(translation.id, textarea.value);
                    }
                  }}
                  className="w-full"
                >
                  Submit Review
                </Button>
              </div>
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
                    onClick={() => handleAdminReview(translation.id, 'approved')}
                    className="flex-1"
                    variant="default"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleAdminReview(translation.id, 'rejected')}
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