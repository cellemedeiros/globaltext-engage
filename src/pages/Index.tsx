import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Globe2, 
  MessageSquare, 
  Users2, 
  FileCheck,
  Mail,
  Linkedin,
  X,
  Instagram,
  LogOut 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import DocumentUploadSection from "@/components/sections/DocumentUploadSection";
import PlansSection from "@/components/sections/PlansSection";
import ContactSection from "@/components/sections/ContactSection";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const featuresRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });

    document.querySelectorAll(".scroll-section").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">GlobalText</div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#languages" className="hover:text-primary transition-colors">Languages</a>
              <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
              <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-light/10 to-transparent" />
        <div className="container mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-7xl font-bold mb-6">
              More than just{" "}
              <span className="text-primary">translations</span>...
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
              Empowering businesses and individuals with precise, culturally relevant communication.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button
                onClick={scrollToFeatures}
                className="px-8 py-6 text-lg hover:scale-105 transition-transform"
              >
                Explore Features
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-lg hover:scale-105 transition-transform"
              >
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-24 bg-secondary-light scroll-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">A Fully Integrated Platform</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              We simplify translation and localization, making it seamless and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe2,
                title: "Advanced Translation",
                description: "Delivering precise, accurate translations powered by cutting-edge technology and human expertise.",
              },
              {
                icon: Users2,
                title: "Localization Expertise",
                description: "Adapt your content for cultural relevance and local market success.",
              },
              {
                icon: FileCheck,
                title: "Humanized Review",
                description: "Quality-checking by professional linguists ensures perfect results.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <TestimonialsSection />
      <DocumentUploadSection />
      <PlansSection />
      <ContactSection />

      {/* Footer */}
      <footer className="bg-secondary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="text-2xl font-bold mb-2">GlobalText</div>
              <p className="text-white/60">© 2024. All rights reserved.</p>
            </div>
            <div className="text-white/60">
              <a href="mailto:support@globaltext.com" className="hover:text-white transition-colors">
                support@globaltext.com
              </a>
            </div>
            <div className="flex gap-4">
              {[
                { icon: Linkedin, href: "#" },
                { icon: X, href: "#" },
                { icon: Instagram, href: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-white/60 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;