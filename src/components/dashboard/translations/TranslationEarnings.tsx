import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TranslationEarningsProps {
  wordCount: number;
  ratePerWord?: number;
}

const TranslationEarnings = ({ wordCount, ratePerWord = 0.08 }: TranslationEarningsProps) => {
  const totalEarnings = wordCount * ratePerWord;

  return (
    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
      <DollarSign className="w-4 h-4" />
      <span>R${totalEarnings.toFixed(2)} ({wordCount} words @ R${ratePerWord}/word)</span>
    </Badge>
  );
};

export default TranslationEarnings;