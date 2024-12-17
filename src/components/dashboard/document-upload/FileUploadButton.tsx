import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
}

const FileUploadButton = ({ onFileSelect }: FileUploadButtonProps) => {
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    onFileSelect(file);
  };

  return (
    <Button asChild className="w-full">
      <label className="cursor-pointer">
        <FileUp className="w-5 h-5 mr-2" />
        Select Document
        <input
          type="file"
          className="hidden"
          accept=".txt,.doc,.docx,.pdf"
          onChange={handleFileChange}
        />
      </label>
    </Button>
  );
};

export default FileUploadButton;