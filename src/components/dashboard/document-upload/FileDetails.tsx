import { Button } from "@/components/ui/button";
import { calculatePrice } from "@/utils/documentUtils";

interface FileDetailsProps {
  fileName: string;
  wordCount: number;
  onTranslate: () => void;
}

const FileDetails = ({ fileName, wordCount, onTranslate }: FileDetailsProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Selected file: {fileName}</p>
      <p className="font-medium">Word count: {wordCount}</p>
      <p className="font-medium">Price: R${calculatePrice(wordCount).toFixed(2)}</p>
      <Button onClick={onTranslate} className="w-full">
        Translate Now
      </Button>
    </div>
  );
};

export default FileDetails;