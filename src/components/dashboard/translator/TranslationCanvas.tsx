import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LanguagePairs from "./LanguagePairs";
import { useQuery } from "@tanstack/react-query";

const TranslationCanvas = () => {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("pt");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const isAdmin = profile?.id === "37665cdd-1fdd-40d0-b485-35148c159bed";

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

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('translations')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create translation record
      const { data: translation, error: insertError } = await supabase
        .from('translations')
        .insert({
          user_id: session.user.id,
          document_name: selectedFile.name,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          status: 'pending_review',
          word_count: 0, // You might want to implement word counting for PDFs
          amount_paid: 0,
          translator_id: session.user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Translation uploaded successfully",
      });

      // Reset form
      setSelectedFile(null);
      setTranslatedText("");
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload translation",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReviewTranslation = async (translationId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('translations')
        .update({
          admin_review_status: status,
          admin_review_notes: notes,
          admin_reviewer_id: session.user.id,
          admin_reviewed_at: new Date().toISOString(),
          status: status === 'approved' ? 'completed' : 'pending_review'
        })
        .eq('id', translationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Translation ${status}`,
      });
    } catch (error) {
      console.error('Review error:', error);
      toast({
        title: "Error",
        description: "Failed to review translation",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {translationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{translationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <LanguagePairs
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceChange={setSourceLanguage}
          onTargetChange={setTargetLanguage}
        />

        <div className="space-y-4">
          <Button asChild className="w-full">
            <label className="cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              {selectedFile ? selectedFile.name : "Upload Translation (PDF)"}
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileSelect}
              />
            </label>
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isTranslating}
            className="w-full"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Submit Translation'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TranslationCanvas;