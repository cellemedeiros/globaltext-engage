import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "@/components/auth/AuthDialog";
import { useNavigate } from "react-router-dom";

interface PendingDocument {
  fileName: string;
  wordCount: number;
  price: number;
}

const DocumentUploadSection = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingDocument, setPendingDocument] = useState<PendingDocument | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      const newAuthState = !!session;
      setIsAuthenticated(newAuthState);
      
      // If user just logged in and there's a pending document, redirect to payment
      if (newAuthState && !isAuthenticated && pendingDocument) {
        navigate(`/payment?amount=${pendingDocument.price}&words=${pendingDocument.wordCount}`);
      }
    });
  }, [isAuthenticated, pendingDocument, navigate]);

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      toast({
        title: "Authentication Required",
        description: "Please sign in or create an account to upload documents.",
      });
    } else {
      // Handle document upload logic for authenticated users
      navigate('/dashboard');
    }
  };

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const calculatePrice = (wordCount: number) => {
    return wordCount * 0.2; // R$0.20 per word
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // For demonstration, using simple text file reader
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const words = calculateWordCount(text);
      const price = calculatePrice(words);

      setPendingDocument({
        fileName: file.name,
        wordCount: words,
        price: price
      });

      if (!isAuthenticated) {
        setShowAuthDialog(true);
      } else {
        navigate(`/payment?amount=${price}&words=${words}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <section id="document-translation" className="py-24 scroll-section">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4 text-center">Single Document Translation</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Upload your document and get an instant estimate. Our professional translators ensure quality at R$0,20 per word, with a maximum delivery time of 48 hours.
        </p>
        
        <Card className="max-w-2xl mx-auto glass">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-4">How it works</h3>
              <ol className="text-left space-y-4">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span className="text-gray-700">Upload your document (.txt, .doc, .docx, or .pdf)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span className="text-gray-700">Get an instant word count and price estimate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span className="text-gray-700">Choose your target language and delivery timeline (max 48 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  <span className="text-gray-700">Receive your professionally translated document</span>
                </li>
              </ol>
            </div>
            
            <div className="space-y-4">
              <Button 
                asChild
                className="w-full md:w-auto mx-auto flex gap-2 hover:scale-105 transition-transform"
              >
                <label className="cursor-pointer">
                  <FileUp className="w-5 h-5" />
                  Upload Document
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                  />
                </label>
              </Button>

              {pendingDocument && (
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Selected file: {pendingDocument.fileName}</p>
                  <p className="font-medium">Word count: {pendingDocument.wordCount}</p>
                  <p className="font-medium mb-4">Estimated price: R${pendingDocument.price.toFixed(2)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        message="Please sign in or create an account to proceed with the translation"
      />
    </section>
  );
};

export default DocumentUploadSection;