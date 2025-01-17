import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import LanguageSelector from "@/components/dashboard/translator/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WordCountDisplay from "./WordCountDisplay";

interface FileUploadFormProps {
  onUploadSuccess: (data: {
    file: File;
    wordCount: number;
    sourceLanguage: string;
    targetLanguage: string;
    extractedText: string;
    filePath: string;
  }) => void;
  isUploading: boolean;
}

const FileUploadForm = ({ onUploadSuccess, isUploading }: FileUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isWordCountConfirmed, setIsWordCountConfirmed] = useState(false);
  const { toast } = useToast();

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

    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    onUploadSuccess({
      file,
      wordCount,
      sourceLanguage,
      targetLanguage,
      extractedText,
      filePath,
    });
  };

  return (
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
  );
};

export default FileUploadForm;