import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DocumentUploadCard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const fileContent = await file.text(); // Assuming the file is text-based
      const calculatedWordCount = fileContent.split(/\s+/).length; // Simple word count logic
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

      const { data: translation, error: translationError } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: file.name,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          word_count: calculatedWordCount,
          status: 'pending', // Ensure status is set to pending
          content: fileContent,
          amount_paid: calculatePrice(calculatedWordCount)
        })
        .select()
        .single();

      if (translationError) throw translationError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reset the form or handle success as needed
      setFile(null);
      setSourceLanguage("");
      setTargetLanguage("");
      setWordCount(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
      <input type="file" onChange={handleFileChange} />
      <div className="mt-4">
        <Button 
          onClick={() => file && handleUpload(file)} 
          disabled={isUploading || !file}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadCard;
