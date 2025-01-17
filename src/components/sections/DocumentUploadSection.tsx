import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculatePrice } from "@/utils/documentUtils";
import AuthDialog from "@/components/auth/AuthDialog";
import { useAuthState } from "@/hooks/useAuthState";

const DocumentUploadSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Processing document...');
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: formData,
      });

      console.log('Response:', data, error);

      if (error) throw error;

      const count = data.wordCount;
      setWordCount(count);

      toast({
        title: "Document processed successfully",
        description: `Word count: ${count}`,
      });
    } catch (error: any) {
      console.error('Error processing document:', error);
      setFile(null);
      setWordCount(0);
      toast({
        title: "Error processing document",
        description: error.message || "Please try again with a different file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslateClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Start Your Translation
            </h2>
            <p className="text-muted-foreground mt-2">
              Upload your document and get an instant quote for professional translation services
            </p>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-gray-300 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-center space-y-2"
                >
                  <div className="text-lg font-medium">
                    {isProcessing ? "Processing..." : "Upload Document"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Supported formats: .txt, .doc, .docx
                  </div>
                </label>
              </div>

              {file && wordCount > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <p className="text-sm text-gray-500">
                          {wordCount} words
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          R${calculatePrice(wordCount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleTranslateClick}
                    className="w-full"
                    size="lg"
                  >
                    Translate Now
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        message="Please sign in or create an account to continue with your translation"
      />
    </section>
  );
};

export default DocumentUploadSection;