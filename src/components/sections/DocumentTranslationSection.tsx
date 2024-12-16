import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

const DocumentTranslationSection = () => {
  return (
    <section id="document-translation" className="py-24 scroll-section">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4 text-center">Single Document Translation</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Upload your document and get an instant estimate. Our professional translators ensure quality at R$0,40 per word.
        </p>
        
        <Card className="max-w-2xl mx-auto glass">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-4">How it works</h3>
              <ol className="text-left space-y-4">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Upload your document (.txt, .doc, .docx, or .pdf)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>Get an instant word count and price estimate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>Choose your target language and delivery timeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  <span>Receive your professionally translated document</span>
                </li>
              </ol>
            </div>
            
            <Button className="w-full md:w-auto mx-auto flex gap-2">
              <FileUp className="w-5 h-5" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DocumentTranslationSection;