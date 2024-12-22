import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadButtonProps {
  onFileSelect: (file: File, wordCount: number, content: string) => void;
}

const FileUploadButton = ({ onFileSelect }: FileUploadButtonProps) => {
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .docx file",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await supabase.functions.invoke('process-document', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to process document');
      }

      const { wordCount, text } = response.data;
      onFileSelect(file, wordCount, text);

    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing Error",
        description: "Unable to process the file. Please try a different format or contact support.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button asChild className="w-full">
      <label className="cursor-pointer">
        <FileUp className="w-5 h-5 mr-2" />
        Select Document
        <input
          type="file"
          className="hidden"
          accept=".txt,.docx"
          onChange={handleFileChange}
        />
      </label>
    </Button>
  );
};

export default FileUploadButton;