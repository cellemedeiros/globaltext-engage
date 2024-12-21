import { useEffect } from "react";
import NavigationSection from "@/components/sections/NavigationSection";
import HeroSection from "@/components/sections/hero/HeroSection";
import FeaturesSection from "@/components/sections/features/FeaturesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import DocumentUploadSection from "@/components/sections/DocumentUploadSection";
import PlansSection from "@/components/sections/PlansSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/sections/Footer";

const Index = () => {
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
    <div className="min-h-screen bg-white">
      <NavigationSection />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <DocumentUploadSection />
        <PlansSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;