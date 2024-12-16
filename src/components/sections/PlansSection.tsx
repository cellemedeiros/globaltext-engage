import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare } from "lucide-react";

const PlansSection = () => {
  const plans = [
    {
      name: "Standard",
      price: "R$400",
      period: "/month",
      features: [
        "Up to 5,000 words per month",
        "Email support",
        "Basic translation tools",
        "48-hour delivery",
        "1 language pair",
        "Basic quality assurance"
      ]
    },
    {
      name: "Premium",
      price: "R$1200",
      period: "/month",
      popular: true,
      features: [
        "Up to 15,000 words per month",
        "Priority email & chat support",
        "Advanced translation tools",
        "24-hour delivery",
        "3 language pairs",
        "Enhanced quality assurance",
        "Glossary management",
        "API access"
      ]
    },
    {
      name: "Business",
      price: "Custom",
      features: [
        "Unlimited words",
        "Dedicated account manager",
        "Enterprise translation tools",
        "Custom delivery times",
        "Unlimited language pairs",
        "Premium quality assurance",
        "Custom glossary & style guides",
        "Full API integration",
        "Custom workflows",
        "Training & onboarding"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-secondary/30 scroll-section">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4 text-center">Choose Your Plan</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Select the perfect plan for your translation needs
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative hover:scale-105 transition-all duration-300 ${
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

              <CardContent className="pt-4">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full hover:scale-105 transition-transform ${
                    plan.name === "Business" 
                      ? 'bg-secondary-dark hover:bg-secondary-dark/90' 
                      : ''
                  }`}
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;