import { Button } from "@/components/ui/button";

interface TranslationSubmitSectionProps {
  translationId?: string;
  isSubmitting: boolean;
  sourceText: string;
  targetText: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const TranslationSubmitSection = ({
  translationId,
  isSubmitting,
  sourceText,
  targetText,
  onSubmit,
  onCancel
}: TranslationSubmitSectionProps) => {
  return (
    <div className="mt-6 px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
      {translationId && (
        <Button
          variant="outline"
          onClick={onCancel}
          className="hover:bg-gray-100"
        >
          Cancel
        </Button>
      )}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || !sourceText.trim() || !targetText.trim()}
        className="bg-primary hover:bg-primary/90"
      >
        {isSubmitting ? "Submitting..." : translationId ? "Update Translation" : "Submit Translation"}
      </Button>
    </div>
  );
};

export default TranslationSubmitSection;