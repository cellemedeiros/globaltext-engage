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
import { calculatePrice } from "@/utils/documentUtils";

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

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        throw error;
      }
      return session;
    },
  });

  const handleFileSelect = (file: File, count: number, content: string) => {
    setFileName(file.name);
    setFileContent(content);
    setWordCount(count);
    console.log(`Word count for ${file.name}: ${count}`);

    if (hasActiveSubscription && wordsRemaining && count > wordsRemaining) {
      toast({
        title: "Word limit exceeded",
        description: `Your current plan has ${wordsRemaining} words remaining. Please upgrade your plan.`,
        variant: "destructive"
      });
    }
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

    try {
      const { data: translation, error: insertError } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: fileName,
          content: fileContent,
          word_count: wordCount,
          status: hasActiveSubscription ? 'pending' : 'awaiting_payment',
          amount_paid: 0,
          subscription_id: hasActiveSubscription ? session.user.id : null,
          source_language: 'en',
          target_language: 'pt',
          price_offered: calculatePrice(wordCount)
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (!hasActiveSubscription) {
        navigate(`/payment?words=${wordCount}&amount=${calculatePrice(wordCount)}&translationId=${translation.id}&documentName=${encodeURIComponent(fileName)}`);
      } else if (wordsRemaining && wordCount > wordsRemaining) {
        navigate('/payment');
      } else {
        toast({
          title: "Success",
          description: "Your document has been submitted for translation",
        });
        
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to submit translation. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (sessionLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

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