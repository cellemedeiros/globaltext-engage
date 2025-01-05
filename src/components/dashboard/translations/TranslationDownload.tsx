import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TranslationDownloadProps {
  filePath?: string;
  documentName: string;
}

const TranslationDownload = ({ filePath, documentName }: TranslationDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!filePath) {
      toast({
        title: "Error",
        description: "No file available for download",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDownloading(true);
      const { data, error } = await supabase.storage
        .from('translations')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading || !filePath}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {isDownloading ? "Downloading..." : "Download"}
    </Button>
  );
};

export default TranslationDownload;