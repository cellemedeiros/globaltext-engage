import { Card } from "@/components/ui/card";
import { BookOpen, Clock, CheckCircle } from "lucide-react";

interface Translation {
  status: string;
  word_count: number;
}

const DashboardStats = ({ translations }: { translations: Translation[] }) => {
  const totalTranslations = translations.length;
  const completedTranslations = translations.filter(t => t.status === 'completed').length;
  const totalWords = translations.reduce((sum, t) => sum + t.word_count, 0);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <BookOpen className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Total Translations</p>
            <p className="text-2xl font-bold">{totalTranslations}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{completedTranslations}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Clock className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Total Words</p>
            <p className="text-2xl font-bold">{totalWords}</p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default DashboardStats;