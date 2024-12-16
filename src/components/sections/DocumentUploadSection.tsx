import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DocumentUploadSection = () => {
  const [wordCount, setWordCount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const { toast } = useToast();

  const calculatePrice = (words: number) => {
    return words * 0.20; // R$0.20 per word
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

    setFileName(file.name);

    // For demonstration, we'll use a simple text file reader
    // In production, you'd want to use proper PDF/DOC parsing libraries
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const words = text.trim().split(/\s+/).length;
      setWordCount(words);
      setPrice(calculatePrice(words));
    };
    reader.readAsText(file);
  };

  const handleProceedToPayment = () => {
    if (wordCount === 0) {
      toast({
        title: "No document uploaded",
        description: "Please upload a document first",
        variant: "destructive"
      });
      return;
    }
    // Here you would redirect to payment page
    window.location.href = `/payment?amount=${price}&words=${wordCount}`;
  };

  return (
    <section id="document-translation" className="py-24 scroll-section">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4 text-center">Single Document Translation</h2>
        <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
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
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Button asChild className="w-full md:w-auto hover:scale-105 transition-transform">
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
                {fileName && (
                  <p className="text-sm text-gray-700">
                    Selected file: {fileName}
                  </p>
                )}
              </div>

              {wordCount > 0 && (
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">Word count: {wordCount}</p>
                  <p className="text-gray-700 mb-4">Estimated price: R${price.toFixed(2)}</p>
                  <Button 
                    onClick={handleProceedToPayment}
                    className="w-full hover:scale-105 transition-transform"
                  >
                    Translate Now
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DocumentUploadSection;