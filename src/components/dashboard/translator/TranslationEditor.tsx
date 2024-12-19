import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface TranslationEditorProps {
  sourceText: string;
  targetText: string;
  onSourceChange: (text: string) => void;
  onTargetChange: (text: string) => void;
  isReadOnly?: boolean;
}

const TranslationEditor = ({
  sourceText,
  targetText,
  onSourceChange,
  onTargetChange,
  isReadOnly = false
}: TranslationEditorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium">Source Text</label>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <textarea
            value={sourceText}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full h-full min-h-[380px] p-4 bg-white resize-none focus:outline-none"
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
        <label className="text-sm font-medium">Target Text</label>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <textarea
            value={targetText}
            onChange={(e) => onTargetChange(e.target.value)}
            className="w-full h-full min-h-[380px] p-4 bg-white resize-none focus:outline-none"
            placeholder="Enter translation..."
            readOnly={isReadOnly}
          />
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default TranslationEditor;