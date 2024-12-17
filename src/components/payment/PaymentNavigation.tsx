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
    // If we came from a specific location, use that
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }

    // If we have a plan parameter and it's an upgrade
    if (plan === 'upgrade') {
      navigate('/dashboard');
      return;
    }

    // If we have a plan parameter (new subscription)
    if (plan) {
      navigate('/#pricing');
      return;
    }

    // If we have words parameter (single document translation)
    if (words) {
      navigate('/dashboard');
      return;
    }

    // Default fallback - go to dashboard
    navigate('/dashboard');
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