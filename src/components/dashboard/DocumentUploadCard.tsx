import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentUploadCardProps {
  hasActiveSubscription: boolean;
  wordsRemaining?: number;
}

const DocumentUploadCard = ({ hasActiveSubscription, wordsRemaining }: DocumentUploadCardProps) => {
  const [fileName, setFileName] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        .includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt, .doc, .docx, or .pdf file",
        variant: "destructive"
      });
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const words = calculateWordCount(text);
      setWordCount(words);

      if (hasActiveSubscription && wordsRemaining && words > wordsRemaining) {
        toast({
          title: "Word limit exceeded",
          description: `Your current plan has ${wordsRemaining} words remaining. Please upgrade your plan.`,
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleTranslate = () => {
    if (!fileName) {
      toast({
        title: "No document selected",
        description: "Please upload a document first",
        variant: "destructive"
      });
      return;
    }

    if (!hasActiveSubscription) {
      navigate(`/payment?words=${wordCount}`);
    } else if (wordsRemaining && wordCount > wordsRemaining) {
      navigate('/payment');
    } else {
      // Handle translation with subscription
      toast({
        title: "Processing translation",
        description: "Your document has been queued for translation",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasActiveSubscription && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have an active subscription. You'll need to purchase translation credits.
            </AlertDescription>
          </Alert>
        )}

        {hasActiveSubscription && wordsRemaining && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Words remaining in your plan: {wordsRemaining}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button asChild className="w-full">
            <label className="cursor-pointer">
              <FileUp className="w-5 h-5 mr-2" />
              Select Document
              <input
                type="file"
                className="hidden"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileUpload}
              />
            </label>
          </Button>

          {fileName && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Selected file: {fileName}</p>
              <p className="font-medium">Word count: {wordCount}</p>
              <Button 
                onClick={handleTranslate} 
                className="w-full"
              >
                Translate Now
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadCard;