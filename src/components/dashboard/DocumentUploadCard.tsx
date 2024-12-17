import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploadCardProps {
  hasActiveSubscription: boolean;
  wordsRemaining?: number;
}

const DocumentUploadCard = ({ hasActiveSubscription, wordsRemaining }: DocumentUploadCardProps) => {
  const [fileName, setFileName] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const calculateWordCount = (text: string) => {
    // Remove special characters and extra whitespace
    const cleanText = text
      .replace(/[\r\n]+/g, " ") // Replace multiple newlines with space
      .replace(/[^\w\s]/g, " ") // Replace special characters with space
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    // Split by whitespace and filter out empty strings
    const words = cleanText.split(" ").filter(word => word.length > 0);
    
    return words.length;
  };

  const calculatePrice = (wordCount: number) => {
    return wordCount * 0.2; // R$0.20 per word
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
      console.log(`Word count for ${file.name}: ${words}`);
      setWordCount(words);

      if (hasActiveSubscription && wordsRemaining && words > wordsRemaining) {
        toast({
          title: "Word limit exceeded",
          description: `Your current plan has ${wordsRemaining} words remaining. Please upgrade your plan.`,
          variant: "destructive"
        });
      }
    };

    // Use readAsText for all file types for now
    // In a production environment, you'd want to use specific parsers for different file types
    reader.readAsText(file);
  };

  const handleTranslate = async () => {
    if (!fileName) {
      toast({
        title: "No document selected",
        description: "Please upload a document first",
        variant: "destructive"
      });
      return;
    }

    if (!session) {
      // Store document info in localStorage before redirecting to auth
      localStorage.setItem('pendingTranslation', JSON.stringify({
        fileName,
        wordCount,
        price: calculatePrice(wordCount)
      }));
      navigate('/?auth=true');
      return;
    }

    if (!hasActiveSubscription) {
      navigate(`/payment?words=${wordCount}&amount=${calculatePrice(wordCount)}`);
    } else if (wordsRemaining && wordCount > wordsRemaining) {
      navigate('/payment');
    } else {
      // Handle translation with subscription
      const { error } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: fileName,
          word_count: wordCount,
          status: 'pending',
          amount_paid: 0, // Using subscription
          subscription_id: hasActiveSubscription ? session.user.id : null,
          source_language: 'en', // Default to English for now
          target_language: 'pt' // Default to Portuguese for now
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit translation. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your document has been queued for translation",
      });
      
      // Refresh the page to update the translations list
      window.location.reload();
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
              <p className="font-medium">Price: R${calculatePrice(wordCount).toFixed(2)}</p>
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