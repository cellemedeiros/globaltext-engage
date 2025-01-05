import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { calculatePrice } from "@/utils/documentUtils";

interface WordCountDisplayProps {
  wordCount: number;
  onConfirm: () => void;
}

const WordCountDisplay = ({ wordCount, onConfirm }: WordCountDisplayProps) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-medium flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Document Analysis
      </h3>
      <p className="mt-2">Word count: {wordCount.toLocaleString()}</p>
      <p className="text-sm text-gray-600 mt-1">
        Estimated cost: ${calculatePrice(wordCount).toFixed(2)}
      </p>
      <Button
        type="button"
        onClick={onConfirm}
        className="mt-3"
      >
        Confirm and Continue
      </Button>
    </div>
  );
};

export default WordCountDisplay;