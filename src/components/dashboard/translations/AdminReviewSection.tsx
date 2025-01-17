import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminReviewSectionProps {
  translationId: string;
  onUpdate: () => void;
}

const AdminReviewSection = ({ translationId, onUpdate }: AdminReviewSectionProps) => {
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
        .eq('id', translationId);

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
  );
};

export default AdminReviewSection;