import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Globe2, MessageSquare, Clock, Shield, Star } from "lucide-react";

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-light/10 to-transparent" />
        <div className="container mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary-dark text-sm font-medium mb-6 inline-block">
              Professional Translation Services
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              Breaking Language Barriers
              <br />
              <span className="text-primary">Globally</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary-dark max-w-2xl mx-auto mb-8">
              Professional translation services in over 100 languages. Fast, accurate, and secure.
            </p>
            <button className="px-8 py-4 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors duration-300 flex items-center gap-2 mx-auto">
              Get Started
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary-light scroll-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary-dark text-sm font-medium mb-6 inline-block">
              Why Choose GlobalText
            </span>
            <h2 className="text-4xl font-bold mb-4">Features that Set Us Apart</h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Experience the perfect blend of human expertise and cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe2,
                title: "100+ Languages",
                description: "Support for all major world languages and regional dialects",
              },
              {
                icon: MessageSquare,
                title: "Expert Translators",
                description: "Native speakers with domain expertise",
              },
              {
                icon: Clock,
                title: "Fast Delivery",
                description: "Quick turnaround times without compromising quality",
              },
              {
                icon: Shield,
                title: "Secure & Confidential",
                description: "Your content is protected with enterprise-grade security",
              },
              {
                icon: Star,
                title: "Quality Assured",
                description: "Multiple rounds of review and quality checks",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl glass hover:shadow-lg transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary scroll-section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Go Global?
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of businesses that trust GlobalText for their translation needs
          </p>
          <button className="px-8 py-4 bg-white text-primary rounded-full font-medium hover:bg-gray-100 transition-colors duration-300">
            Start Translating Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;