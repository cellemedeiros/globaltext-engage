import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "@/components/dashboard/translator/LanguageSelector";
import { Upload } from "lucide-react";
import WordCountDisplay from "./document-upload/WordCountDisplay";
import { calculatePrice } from "@/utils/documentUtils";
import { useNavigate } from "react-router-dom";

interface DocumentUploadCardProps {
  hasActiveSubscription: boolean;
  wordsRemaining?: number;
}

const DocumentUploadCard = ({ hasActiveSubscription, wordsRemaining }: DocumentUploadCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isWordCountConfirmed, setIsWordCountConfirmed] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFile(file);
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-document', {
        body: formData,
      });

      if (error) throw error;

      setWordCount(data.wordCount);
      setExtractedText(data.text);
      setIsWordCountConfirmed(false);
      
      toast({
        title: "Document processed",
        description: `Word count: ${data.wordCount.toLocaleString()}. Please confirm to proceed.`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process document",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !sourceLanguage || !targetLanguage) return;

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

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', '37665cdd-1fdd-40d0-b485-35148c159bed')
        .single();

      const isAdmin = !!profile;

      // If user is admin or has an active subscription with sufficient words, proceed
      if (isAdmin || (hasActiveSubscription && wordsRemaining && wordsRemaining >= wordCount)) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: storageError } = await supabase.storage
          .from('translations')
          .upload(filePath, file);

        if (storageError) throw storageError;

        const { error } = await supabase
          .from('translations')
          .insert({
            user_id: session.user.id,
            document_name: file.name,
            source_language: sourceLanguage,
            target_language: targetLanguage,
            word_count: wordCount,
            status: 'pending',
            amount_paid: isAdmin ? 0 : calculatePrice(wordCount),
            file_path: filePath,
            content: extractedText,
            price_offered: calculatePrice(wordCount)
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Document uploaded successfully and available for translators",
        });

        // Reset form
        setFile(null);
        setSourceLanguage("");
        setTargetLanguage("");
        setWordCount(0);
        setExtractedText("");
        setIsWordCountConfirmed(false);
      } else {
        // Redirect to payment page for single translation
        const amount = calculatePrice(wordCount);
        navigate(`/payment?words=${wordCount}&amount=${amount}&documentName=${encodeURIComponent(file.name)}`);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".txt,.doc,.docx"
            className="w-full p-2 border rounded"
            disabled={isProcessing || isUploading}
          />
        </div>
        
        {wordCount > 0 && !isWordCountConfirmed && (
          <WordCountDisplay 
            wordCount={wordCount}
            onConfirm={() => setIsWordCountConfirmed(true)}
          />
        )}

        {isWordCountConfirmed && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <LanguageSelector
                value={sourceLanguage}
                onChange={setSourceLanguage}
                label="Source"
              />
              <LanguageSelector
                value={targetLanguage}
                onChange={setTargetLanguage}
                label="Target"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUploading || !file || !sourceLanguage || !targetLanguage}
              className="w-full"
            >
              {isUploading ? (
                "Uploading..."
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </span>
              )}
            </Button>
          </>
        )}
      </form>
    </div>
  );
};

export default DocumentUploadCard;