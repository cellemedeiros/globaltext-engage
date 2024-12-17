import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PaymentNavigationProps {
  plan: string | null;
  words: string | null;
}

const PaymentNavigation = ({ plan, words }: PaymentNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If we have a plan parameter (new subscription)
    if (plan) {
      navigate('/', { replace: true });
      return;
    }

    // If we have words parameter (single document translation)
    if (words) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Default fallback - go to landing page
    navigate('/', { replace: true });
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleBack}
      className="mb-8 hover:bg-secondary/50"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );
};

export default PaymentNavigation;