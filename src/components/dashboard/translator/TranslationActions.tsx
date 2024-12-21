import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface TranslationActionsProps {
  selectedFile: File | null;
  isSubmitting: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  disabled: boolean;
}

const TranslationActions = ({
  selectedFile,
  isSubmitting,
  onFileSelect,
  onSubmit,
  disabled
}: TranslationActionsProps) => {
  return (
    <div className="space-y-4 mt-6">
      <Button asChild variant="outline" className="w-full bg-white hover:bg-gray-50">
        <label className="cursor-pointer flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" />
          {selectedFile ? selectedFile.name : "Upload Translation (PDF)"}
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={onFileSelect}
          />
        </label>
      </Button>

      <Button
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        className="w-full bg-primary hover:bg-primary-dark text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Translation'
        )}
      </Button>
    </div>
  );
};

export default TranslationActions;