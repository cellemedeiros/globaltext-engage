import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { motion } from "framer-motion";

interface AdminReviewPanelProps {
  translationId: string;
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
}

const AdminReviewPanel = ({ translationId, onApprove, onReject }: AdminReviewPanelProps) => {
  const [notes, setNotes] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-6 p-4 border rounded-lg bg-gray-50"
    >
      <h3 className="font-medium">Review Translation</h3>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add review notes (optional)..."
        className="min-h-[100px] bg-white"
      />
      <div className="flex gap-4">
        <Button
          onClick={() => onApprove(notes)}
          className="flex-1"
          variant="default"
        >
          Approve
        </Button>
        <Button
          onClick={() => onReject(notes)}
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