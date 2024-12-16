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

      {/* Hero Section with enhanced animations */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-light/10 to-transparent" />
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
            backgroundSize: ["100% 100%", "120% 120%"]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
          style={{
            backgroundImage: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)",
          }}
        />
        <div className="container mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.h1 
              className="text-4xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              More than just <span className="gradient-text">translations</span>...
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button
                onClick={handleExploreClick}
                className="px-8 py-6 text-lg hover:scale-105 transition-transform bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg"
              >
                {t('hero.explore')}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-lg hover:scale-105 transition-transform border-2"
              >
                {t('hero.contact')}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with enhanced cards */}
      <section id="features" className="py-24 bg-secondary-light scroll-section relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
          style={{
            backgroundImage: "linear-gradient(60deg, #abecd6 0%, #fbed96 100%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {t('features.title')}
            </motion.h2>
            <motion.p 
              className="text-gray-700 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {t('features.subtitle')}
            </motion.p>
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-2 border-gray-100">
                  <CardContent className="p-0">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <feature.icon className="w-12 h-12 text-primary mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{t(feature.titleKey)}</h3>
                    <p className="text-gray-700">{t(feature.descriptionKey)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <TestimonialsSection />
      <DocumentUploadSection />
      <PlansSection />
      <ContactSection />

      {/* Enhanced Footer */}
      <footer className="bg-secondary-dark text-white py-12 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-5"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
          style={{
            backgroundImage: "linear-gradient(to right, #243949 0%, #517fa4 100%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Globe className="w-6 h-6" />
                GlobalText
              </div>
              <p className="text-white/60">© 2024. All rights reserved.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-white/60"
            >
              <a href="mailto:support@globaltext.com" className="hover:text-white transition-colors">
                support@globaltext.com
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex gap-4"
            >
              {[
                { icon: Linkedin, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="text-white/60 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="w-6 h-6" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;