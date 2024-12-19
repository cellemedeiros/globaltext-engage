import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { code: 'pt', name: 'Portuguese' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' }
];

interface LanguagePairsProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
}

const LanguagePairs = ({ sourceLanguage, targetLanguage, onSourceChange, onTargetChange }: LanguagePairsProps) => {
  return (
    <div className="flex gap-4 items-center">
      <Select value={sourceLanguage} onValueChange={onSourceChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Source Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              disabled={lang.code === targetLanguage}
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span>→</span>

      <Select value={targetLanguage} onValueChange={onTargetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Target Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              disabled={lang.code === sourceLanguage}
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguagePairs;