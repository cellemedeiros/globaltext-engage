import { motion } from "framer-motion";
import { Globe, Users, FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
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
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 scroll-section relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 opacity-5"
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
          backgroundImage: "radial-gradient(circle at center, rgba(30,174,219,0.2) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('features.title')}
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t('features.subtitle')}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descriptionKey)}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;