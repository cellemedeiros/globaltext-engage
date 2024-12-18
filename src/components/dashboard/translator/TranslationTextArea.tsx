import { ScrollArea } from "@/components/ui/scroll-area";

interface TranslationTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
}

const TranslationTextArea = ({ value, onChange, placeholder, readOnly = false }: TranslationTextAreaProps) => {
  return (
    <ScrollArea className="h-[500px] w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full h-full min-h-[480px] p-4 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </ScrollArea>
  );
};

export default TranslationTextArea;