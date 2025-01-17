import { format } from "date-fns";
import { FileText, Clock, Languages } from "lucide-react";

interface TranslationHeaderProps {
  documentName: string;
  createdAt: string;
  sourceLanguage: string;
  targetLanguage: string;
  deadline?: string;
}

const TranslationHeader = ({
  documentName,
  createdAt,
  sourceLanguage,
  targetLanguage,
  deadline
}: TranslationHeaderProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        {documentName}
      </h3>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Languages className="w-4 h-4" />
          {sourceLanguage} → {targetLanguage}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDate(createdAt)}
        </div>
        {deadline && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Due: {formatDate(deadline)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationHeader;