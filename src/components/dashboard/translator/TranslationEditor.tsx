import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface TranslationEditorProps {
  sourceText: string;
  targetText: string;
  onSourceChange: (text: string) => void;
  onTargetChange: (text: string) => void;
  isReadOnly?: boolean;
  isTranslating?: boolean;
}

const TranslationEditor = ({
  sourceText,
  targetText,
  onSourceChange,
  onTargetChange,
  isReadOnly = false,
  isTranslating = false
}: TranslationEditorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Source Text</label>
        </div>
        <ScrollArea className="h-[500px] w-full rounded-lg border border-gray-200">
          <textarea
            value={sourceText}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full h-full min-h-[480px] p-4 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
            placeholder="Enter source text..."
            readOnly={isReadOnly}
          />
        </ScrollArea>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Target Text</label>
          {isTranslating && (
            <div className="flex items-center text-sm text-primary">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Translating...
            </div>
          )}
        </div>
        <ScrollArea className="h-[500px] w-full rounded-lg border border-gray-200">
          <textarea
            value={targetText}
            onChange={(e) => onTargetChange(e.target.value)}
            className="w-full h-full min-h-[480px] p-4 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
            placeholder="Enter translation..."
            readOnly={isReadOnly || isTranslating}
          />
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default TranslationEditor;