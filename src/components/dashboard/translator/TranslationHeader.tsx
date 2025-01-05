import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface TranslationHeaderProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
}

const TranslationHeader = ({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange
}: TranslationHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold text-gray-800">Translation Workspace</h2>
      </div>
      <div className="flex items-center gap-4">
        <select
          value={sourceLanguage}
          onChange={(e) => onSourceChange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
        </select>
        <span className="text-gray-400">→</span>
        <select
          value={targetLanguage}
          onChange={(e) => onTargetChange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20"
        >
          <option value="pt">Portuguese</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
        </select>
      </div>
    </motion.div>
  );
};

export default TranslationHeader;