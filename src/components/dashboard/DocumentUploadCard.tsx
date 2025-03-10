import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import FileUploadForm from "./document-upload/FileUploadForm";
import { createTranslationRecord } from "./document-upload/TranslationCreator";
import { calculatePrice } from "@/utils/documentUtils";

interface DocumentUploadCardProps {
  hasActiveSubscription: boolean;
  wordsRemaining?: number;
}

const DocumentUploadCard = ({ hasActiveSubscription, wordsRemaining }: DocumentUploadCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUploadSuccess = async (data: {
    file: File;
    wordCount: number;
    sourceLanguage: string;
    targetLanguage: string;
    extractedText: string;
    filePath: string;
  }) => {
    try {
      setIsUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to upload documents",
          variant: "destructive"
        });
        return;
      }

      const isAdmin = session.user.email === 'bispomathews@gmail.com';

      // Check if user has sufficient words remaining before uploading
      if (!isAdmin && (!wordsRemaining || wordsRemaining < data.wordCount)) {
        toast({
          title: "Insufficient Words",
          description: "You don't have enough words remaining in your subscription",
          variant: "destructive"
        });
        navigate(`/payment?words=${data.wordCount}&amount=${calculatePrice(data.wordCount)}&documentName=${encodeURIComponent(data.file.name)}&filePath=${data.filePath}&sourceLanguage=${data.sourceLanguage}&targetLanguage=${data.targetLanguage}&content=${encodeURIComponent(data.extractedText)}`);
        return;
      }

      // Upload file to storage
      const { error: storageError } = await supabase.storage
        .from('translations')
        .upload(data.filePath, data.file);

      if (storageError) throw storageError;

      const { calculatedPrice } = await createTranslationRecord(data);

      // If user is admin or has sufficient words in subscription, redirect to appropriate dashboard
      if (isAdmin || (hasActiveSubscription && wordsRemaining && wordsRemaining >= data.wordCount)) {
        toast({
          title: "Success",
          description: "Document uploaded successfully and available for translators",
        });
        
        navigate(isAdmin ? '/translator-dashboard' : '/dashboard');
      } else {
        // Redirect non-admin users to payment
        navigate(`/payment?words=${data.wordCount}&amount=${calculatedPrice}&documentName=${encodeURIComponent(data.file.name)}&filePath=${data.filePath}&sourceLanguage=${data.sourceLanguage}&targetLanguage=${data.targetLanguage}&content=${encodeURIComponent(data.extractedText)}`);
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      <FileUploadForm 
        onUploadSuccess={handleUploadSuccess}
        isUploading={isUploading}
      />
    </div>
  );
};

export default DocumentUploadCard;