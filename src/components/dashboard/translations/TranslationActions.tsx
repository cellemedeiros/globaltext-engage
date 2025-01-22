import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";

interface TranslationActionsProps {
  translationId: string;
  status: string;
  onUpdate: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const TranslationActions = ({
  translationId,
  status,
  onUpdate,
  onAccept,
  onDecline,
}: TranslationActionsProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFinishProject = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload the translated document before finishing",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('translations')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Update translation status and file path
      const { error: updateError } = await supabase
        .from('translations')
        .update({
          status: 'pending_admin_review',
          translated_file_path: filePath,
          completed_at: new Date().toISOString()
        })
        .eq('id', translationId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Translation submitted for review",
      });
      onUpdate();
    } catch (error) {
      console.error('Error finishing project:', error);
      toast({
        title: "Error",
        description: "Failed to submit translation",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="flex gap-4">
        <Button 
          onClick={onAccept}
          className="flex-1"
          variant="default"
        >
          Accept Translation
        </Button>
        <Button 
          onClick={onDecline}
          className="flex-1"
          variant="outline"
        >
          Decline
        </Button>
      </div>
    );
  }

  if (status === 'in_progress') {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" className="w-full">
          <label className="cursor-pointer flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            {selectedFile ? selectedFile.name : "Upload Translated Document (PDF)"}
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </label>
        </Button>
        
        <Button 
          onClick={handleFinishProject}
          className="w-full"
          variant="default"
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Submit Translation'
          )}
        </Button>
      </div>
    );
  }

  return null;
};

export default TranslationActions;