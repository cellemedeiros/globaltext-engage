import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();

  const handleExploreClick = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 pt-20 bg-gradient-to-b from-background/5 to-background">
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, 
              rgba(56, 189, 248, 0.1) 0%, 
              rgba(168, 85, 247, 0.05) 25%, 
              rgba(0, 0, 0, 0) 50%)`,
            backgroundSize: '100% 100%',
          }}
        />
      </div>
      
      <div className="container mx-auto max-w-6xl z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm font-medium text-primary bg-primary/10 w-fit mx-auto px-4 py-1 rounded-full"
          >
            <Sparkles className="w-4 h-4" />
            Powered by Advanced AI
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            AI Translation
            <br />
            <span className="text-foreground">for the Modern Web</span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Transform your content into any language instantly with our advanced AI translation engine. 
            Built for developers, designed for scale.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button
              onClick={handleExploreClick}
              size="lg"
              className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Try it now
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg border-2 hover:bg-accent transition-all duration-300"
            >
              <Globe className="w-5 h-5 mr-2" />
              View API Docs
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="pt-12 text-sm text-muted-foreground"
          >
            <p className="flex items-center justify-center gap-8">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                99.9% Uptime
              </span>
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                10M+ Words Translated Daily
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;