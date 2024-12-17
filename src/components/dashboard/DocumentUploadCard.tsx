import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FileUploadButton from "./document-upload/FileUploadButton";
import FileDetails from "./document-upload/FileDetails";
import { calculateWordCount, calculatePrice } from "@/utils/documentUtils";

interface DocumentUploadCardProps {
  hasActiveSubscription: boolean;
  wordsRemaining?: number;
}

const DocumentUploadCard = ({ hasActiveSubscription, wordsRemaining }: DocumentUploadCardProps) => {
  const [fileName, setFileName] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
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

  const handleFileSelect = (file: File) => {
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
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

    reader.readAsText(file);
  };

  const handleTranslate = async () => {
    if (!fileName || !fileContent) {
      toast({
        title: "No document selected",
        description: "Please upload a document first",
        variant: "destructive"
      });
      return;
    }

    if (!session) {
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
      try {
        // Create translation record
        const { data: translation, error: insertError } = await supabase
          .from('translations')
          .insert({
            user_id: session.user.id,
            document_name: fileName,
            content: fileContent,
            word_count: wordCount,
            status: 'processing',
            amount_paid: 0,
            subscription_id: hasActiveSubscription ? session.user.id : null,
            source_language: 'en',
            target_language: 'pt'
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Trigger AI translation
        const response = await fetch('/functions/v1/translate-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            translationId: translation.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to initiate translation');
        }

        toast({
          title: "Success",
          description: "Your document has been submitted for translation",
        });
        
        // Refresh the page to update the translations list
        window.location.reload();
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to submit translation. Please try again.",
          variant: "destructive"
        });
      }
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
          <FileUploadButton onFileSelect={handleFileSelect} />

          {fileName && (
            <FileDetails
              fileName={fileName}
              wordCount={wordCount}
              onTranslate={handleTranslate}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadCard;