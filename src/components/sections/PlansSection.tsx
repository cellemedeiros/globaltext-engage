import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const PlansSection = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handlePlanSelection = (planName: string, price: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      toast({
        title: "Authentication Required",
        description: "Please sign in or create an account to select a plan.",
      });
    } else {
      if (planName === "Business") {
        // Handle business plan contact logic
      } else {
        navigate(`/payment?plan=${planName}&amount=${price.replace("R$", "")}`);
      }
    }
  };

  const plans = [
    {
      name: "Standard",
      price: "R$400",
      period: "/month",
      features: [
        { text: "Up to 5,000 words per month", available: true },
        { text: "Email support", available: true },
        { text: "Basic translation tools", available: true },
        { text: "48-hour delivery", available: true },
        { text: "1 language pair", available: true },
        { text: "Basic quality assurance", available: true },
        { text: "Glossary management", available: false },
        { text: "API access", available: false },
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
        { text: "Glossary management", available: true },
        { text: "API access", available: true },
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
        { text: "Full API integration", available: true },
        { text: "Custom workflows", available: true },
        { text: "Training & onboarding", available: true }
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-secondary/30 scroll-section">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4 text-center">Choose Your Plan</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Select the perfect plan for your translation needs. All plans include translations at R$0.20 per word.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative flex flex-col hover:scale-105 transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pt-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-primary">
                  {plan.price}
                  {plan.period && <span className="text-base font-normal text-gray-600">{plan.period}</span>}
                </div>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col">
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      {feature.available ? (
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <span className={feature.available ? "" : "text-gray-400"}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      className={`w-full hover:scale-105 transition-transform mt-auto ${
                        plan.name === "Business" 
                          ? 'bg-secondary-dark hover:bg-secondary-dark/90' 
                          : ''
                      }`}
                      onClick={() => handlePlanSelection(plan.name, plan.price)}
                    >
                      {plan.name === "Business" ? (
                        <>
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Contact Sales
                        </>
                      ) : (
                        "Get Started"
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <Auth
                      supabaseClient={supabase}
                      appearance={{ theme: ThemeSupa }}
                      theme="light"
                      providers={[]}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;