import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminReviewPanel = () => {
  const [selectedTranslation, setSelectedTranslation] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!selectedTranslation) return;

    try {
      const { error } = await supabase
        .from('translations')
        .update({
          admin_review_status: 'approved',
          admin_review_notes: reviewNotes,
          status: 'completed'
        })
        .eq('id', selectedTranslation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation approved successfully",
      });

      setSelectedTranslation(null);
      setReviewNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve translation",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!selectedTranslation) return;

    try {
      const { error } = await supabase
        .from('translations')
        .update({
          admin_review_status: 'rejected',
          admin_review_notes: reviewNotes,
          status: 'pending_review'
        })
        .eq('id', selectedTranslation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation rejected",
      });

      setSelectedTranslation(null);
      setReviewNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject translation",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-6 p-4 border rounded-lg bg-gray-50"
    >
      <h3 className="font-medium">Review Translation</h3>
      <Textarea
        value={reviewNotes}
        onChange={(e) => setReviewNotes(e.target.value)}
        placeholder="Add review notes (optional)..."
        className="min-h-[100px] bg-white"
      />
      <div className="flex gap-4">
        <Button
          onClick={handleApprove}
          className="flex-1"
          variant="default"
        >
          Approve
        </Button>
        <Button
          onClick={handleReject}
          className="flex-1"
          variant="destructive"
        >
          Reject
        </Button>
      </div>
    </motion.div>
  );
};

export default AdminReviewPanel;