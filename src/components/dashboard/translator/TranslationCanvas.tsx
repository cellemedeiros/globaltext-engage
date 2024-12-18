import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TranslationCanvas = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to translate",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/translate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: sourceText,
          sourceLanguage: "en",
          targetLanguage: "es",
        }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const data = await response.json();
      setTranslatedText(data.translation);

      toast({
        title: "Success",
        description: "Translation completed",
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Translation Canvas</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <Tabs defaultValue="source">
            <TabsList className="w-full">
              <TabsTrigger value="source" className="flex-1">Source Text</TabsTrigger>
            </TabsList>
            <TabsContent value="source">
              <ScrollArea className="h-[500px] w-full">
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="w-full h-full min-h-[480px] p-4 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-4">
          <Tabs defaultValue="translation">
            <TabsList className="w-full">
              <TabsTrigger value="translation" className="flex-1">Translation</TabsTrigger>
            </TabsList>
            <TabsContent value="translation">
              <ScrollArea className="h-[500px] w-full">
                <textarea
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  placeholder="Translation will appear here..."
                  className="w-full h-full min-h-[480px] p-4 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button onClick={handleTranslate}>
          Translate
        </Button>
      </div>
    </div>
  );
};

export default TranslationCanvas;