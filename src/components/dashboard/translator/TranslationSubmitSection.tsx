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
    <div className="mt-6 flex justify-end gap-4">
      {translationId && (
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || !sourceText.trim() || !targetText.trim()}
      >
        {isSubmitting ? "Submitting..." : translationId ? "Update Translation" : "Submit Translation"}
      </Button>
    </div>
  );
};

export default TranslationSubmitSection;