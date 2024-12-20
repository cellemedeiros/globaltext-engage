import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

interface TranslationItemProps {
  translation: Translation;
  role?: 'client' | 'translator' | 'admin';
  onUpdate: () => void;
}

const TranslationItem = ({ translation, role, onUpdate }: TranslationItemProps) => {
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review translation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-4 w-full">
          <div>
            <h3 className="font-medium mb-1">{translation.document_name}</h3>
            <p className="text-sm text-muted-foreground">
              {translation.source_language} → {translation.target_language}
            </p>
          </div>
          
          {(role === 'translator' || role === 'admin') && (
            <div className="space-y-4">
              {translation.content && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Original Content</h4>
                  <p className="text-sm whitespace-pre-wrap">{translation.content}</p>
                </div>
              )}
              
              {translation.ai_translated_content && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">AI Translation</h4>
                  <p className="text-sm whitespace-pre-wrap">{translation.ai_translated_content}</p>
                </div>
              )}

              {role === 'translator' && translation.status === 'pending_review' && (
                <>
                  <textarea
                    className="w-full min-h-[200px] p-3 rounded-lg border resize-y"
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
                </>
              )}

              {role === 'admin' && translation.status === 'pending_admin_review' && (
                <div className="space-y-4">
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-lg border resize-y"
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
        <div className="text-right ml-4">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
            {translation.status}
          </span>
          <p className="text-sm text-muted-foreground mt-1">
            {translation.word_count} words
          </p>
          {translation.admin_review_status && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-2 ${
              translation.admin_review_status === 'approved' 
                ? 'bg-green-100 text-green-800'
                : translation.admin_review_status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {translation.admin_review_status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationItem;