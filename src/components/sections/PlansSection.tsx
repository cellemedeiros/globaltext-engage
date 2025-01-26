import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlanCard from "./pricing/PlanCard";

const PlansSection = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const plans = [
    {
      name: "Standard",
      price: "R$400",
      period: "/month",
      features: [
        { text: "Up to 10,000 words per month", available: true },
        { text: "Email support", available: true },
        { text: "Basic translation tools", available: true },
        { text: "48-hour delivery", available: true },
        { text: "1 language pair", available: true },
        { text: "Basic quality assurance", available: true },
        { text: "Custom delivery times", available: false },
        { text: "Dedicated account manager", available: false }
      ]
    },
    {
      name: "Premium",
      price: "R$1200",
      period: "/month",
      popular: true,
      features: [
        { text: "Up to 15,000 words per month", available: true },
        { text: "Priority email & chat support", available: true },
        { text: "Advanced translation tools", available: true },
        { text: "24-hour delivery", available: true },
        { text: "3 language pairs", available: true },
        { text: "Enhanced quality assurance", available: true },
        { text: "Custom delivery times", available: false },
        { text: "Dedicated account manager", available: false }
      ]
    },
    {
      name: "Business",
      price: "Custom",
      features: [
        { text: "Unlimited words", available: true },
        { text: "Dedicated account manager", available: true },
        { text: "Enterprise translation tools", available: true },
        { text: "Custom delivery times", available: true },
        { text: "Unlimited language pairs", available: true },
        { text: "Premium quality assurance", available: true },
        { text: "Custom glossary & style guides", available: true },
        { text: "Custom workflows", available: true },
        { text: "Training & onboarding", available: true }
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-secondary/30 dark:bg-secondary-dark/10 scroll-section">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4 text-center">Choose Your Plan</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Select the perfect plan for your translation needs.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PlanCard 
              key={index}
              {...plan}
              isAuthenticated={isAuthenticated}
              onAuthChange={setShowAuthDialog}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;