import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface TranslationTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
}

const TranslationTextArea = ({ value, onChange, placeholder, readOnly = false }: TranslationTextAreaProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ScrollArea className="h-[500px] w-full rounded-md border">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full h-full min-h-[480px] p-4 bg-white rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
        />
      </ScrollArea>
    </motion.div>
  );
};

export default TranslationTextArea;