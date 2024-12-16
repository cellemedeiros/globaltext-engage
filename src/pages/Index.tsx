import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Globe, Users, FileCheck, Linkedin, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import DocumentUploadSection from "@/components/sections/DocumentUploadSection";
import PlansSection from "@/components/sections/PlansSection";
import ContactSection from "@/components/sections/ContactSection";
import NavigationSection from "@/components/sections/NavigationSection";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  const handleExploreClick = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
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
      <NavigationSection />

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
              <span className="gradient-text">{t('hero.title')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleExploreClick}
                className="px-8 py-6 text-lg hover:scale-105 transition-transform"
              >
                {t('hero.explore')}
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-lg hover:scale-105 transition-transform"
              >
                {t('hero.contact')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary-light scroll-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                titleKey: 'features.translation.title',
                descriptionKey: 'features.translation.description',
              },
              {
                icon: Users,
                titleKey: 'features.localization.title',
                descriptionKey: 'features.localization.description',
              },
              {
                icon: FileCheck,
                titleKey: 'features.review.title',
                descriptionKey: 'features.review.description',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-gray-700">{t(feature.descriptionKey)}</p>
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
                { icon: Twitter, href: "#" },
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