import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  features: { text: string; available: boolean; }[];
  popular?: boolean;
  isAuthenticated: boolean;
  onAuthChange: Dispatch<SetStateAction<boolean>>;
}

const PlanCard = ({ name, price, period, features, popular, isAuthenticated, onAuthChange }: PlanCardProps) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      onAuthChange(true);
      return;
    }

    if (!name || !price) {
      console.error("Plan name or price is missing");
      return;
    }

    if (name === "Business") {
      // Handle business plan contact logic
    } else {
      // For subscription plans, only pass the plan name and price
      const cleanPrice = price.replace("R$", "").trim();
      navigate(`/payment?plan=${encodeURIComponent(name)}&amount=${encodeURIComponent(cleanPrice)}&type=subscription`);
    }
  };

  return (
    <Card className={`relative p-6 ${popular ? 'border-primary shadow-lg' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold mb-2">{name}</h3>
        <div className="text-3xl font-bold mb-2">{price}</div>
        {period && <p className="text-muted-foreground">{period}</p>}
      </div>
      
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className={`h-4 w-4 mr-2 ${feature.available ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={feature.available ? '' : 'text-muted-foreground'}>{feature.text}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        onClick={handleGetStarted}
        className="w-full"
        variant={popular ? "default" : "outline"}
      >
        Get Started
      </Button>
    </Card>
  );
};

export default PlanCard;