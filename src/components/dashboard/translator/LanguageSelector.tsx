import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' }
];

const LanguageSelector = ({ value, onChange, label }: LanguageSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      <label className="text-sm font-medium text-gray-700">{label} Language</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-white hover:bg-gray-50 transition-colors duration-300">
          <SelectValue placeholder={`Select ${label} language`} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="hover:bg-primary/10 cursor-pointer transition-colors duration-200"
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default LanguageSelector;