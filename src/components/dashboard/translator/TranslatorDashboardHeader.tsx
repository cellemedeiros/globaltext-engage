import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TranslatorDashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Go Back
      </Button>
      <h1 className="text-3xl font-bold">Translator Dashboard</h1>
    </div>
  );
};

export default TranslatorDashboardHeader;