import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculatePrice } from "@/utils/documentUtils";
import LanguageSelector from "@/components/dashboard/translator/LanguageSelector";

interface DocumentUploadCardProps {
  hasActiveSubscription: boolean;
  wordsRemaining?: number;
}

const DocumentUploadCard = ({ hasActiveSubscription, wordsRemaining }: DocumentUploadCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !sourceLanguage || !targetLanguage) return;

    try {
      setIsUploading(true);
      
      const fileContent = await file.text();
      const calculatedWordCount = fileContent.split(/\s+/).length;
      setWordCount(calculatedWordCount);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to upload documents",
          variant: "destructive"
        });
        return;
      }

      if (!hasActiveSubscription && (!wordsRemaining || wordsRemaining < calculatedWordCount)) {
        toast({
          title: "Insufficient Words",
          description: "Please upgrade your subscription or purchase more words",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: file.name,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          word_count: calculatedWordCount,
          status: 'pending',
          content: fileContent,
          amount_paid: calculatePrice(calculatedWordCount)
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      setFile(null);
      setSourceLanguage("");
      setTargetLanguage("");
      
      // Reset the form
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
          />
        </div>
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
        <Button type="submit" disabled={isUploading || !file}>
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </form>
    </div>
  );
};

export default DocumentUploadCard;