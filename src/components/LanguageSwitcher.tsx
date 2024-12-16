import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe2 } from "lucide-react";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] bg-white">
        <Globe2 className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg min-w-[140px]">
        {languages.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            className="hover:bg-gray-100 cursor-pointer"
          >
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;