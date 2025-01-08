import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TranslationDownloadProps {
  filePath?: string;
  documentName: string;
  variant?: 'original' | 'translation';
}

const TranslationDownload = ({ 
  filePath, 
  documentName, 
  variant = 'original' 
}: TranslationDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!filePath) {
      toast({
        title: "Error",
        description: variant === 'translation' 
          ? "No translated file available yet" 
          : "No file available for download",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDownloading(true);
      console.log('Downloading file:', filePath);
      const { data, error } = await supabase.storage
        .from('translations')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      const prefix = variant === 'translation' ? 'translated_' : '';
      a.download = `${prefix}${documentName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${variant === 'translation' ? 'Translated document' : 'Original document'} downloaded successfully`,
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
      {isDownloading ? "Downloading..." : (
        variant === 'original' 
          ? "Download Original" 
          : "Download Translation"
      )}
    </Button>
  );
};

export default TranslationDownload;