import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculatePrice } from "@/utils/documentUtils";
import LanguageSelector from "@/components/dashboard/translator/LanguageSelector";
import { FileText, Upload } from "lucide-react";

interface DocumentUploadCardProps {
  hasActiveSubscription: boolean;
  wordsRemaining?: number;
}

const DocumentUploadCard = ({ hasActiveSubscription, wordsRemaining }: DocumentUploadCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isWordCountConfirmed, setIsWordCountConfirmed] = useState(false);

  const sanitizeContent = (content: string): string => {
    return content
      .replace(/\u0000/g, '') // Remove null bytes
      .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove invalid Unicode characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ''); // Remove control characters
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFile(file);
    setIsProcessing(true);
    
    try {
      const fileContent = await file.text();
      const sanitizedContent = sanitizeContent(fileContent);
      const calculatedWordCount = sanitizedContent.split(/\s+/).length;
      setWordCount(calculatedWordCount);
      setIsWordCountConfirmed(false);
      
      toast({
        title: "Document processed",
        description: `Word count: ${calculatedWordCount}. Please confirm to proceed.`,
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

      if (!hasActiveSubscription && (!wordsRemaining || wordsRemaining < wordCount)) {
        toast({
          title: "Insufficient Words",
          description: "Please upgrade your subscription or purchase more words",
          variant: "destructive"
        });
        return;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: storageError } = await supabase.storage
        .from('translations')
        .upload(filePath, file);

      if (storageError) {
        throw storageError;
      }

      // Get file content for translation
      const fileContent = await file.text();
      const sanitizedContent = sanitizeContent(fileContent);

      const { error } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: file.name,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          word_count: wordCount,
          status: 'pending',
          content: sanitizedContent,
          amount_paid: calculatePrice(wordCount),
          file_path: filePath
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      setFile(null);
      setSourceLanguage("");
      setTargetLanguage("");
      setWordCount(0);
      setIsWordCountConfirmed(false);
      
      if (event.target instanceof HTMLFormElement) {
        event.target.reset();
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
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Analysis
            </h3>
            <p className="mt-2">Word count: {wordCount}</p>
            <p className="text-sm text-gray-600 mt-1">
              Estimated cost: ${calculatePrice(wordCount)}
            </p>
            <Button
              type="button"
              onClick={() => setIsWordCountConfirmed(true)}
              className="mt-3"
            >
              Confirm and Continue
            </Button>
          </div>
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