import { FileText, Globe2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{t('features.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FileText className="w-8 h-8 text-primary" />}
            title={t('features.translation.title')}
            description={t('features.translation.description')}
            additionalInfo="Supported formats: .txt, .doc, and .docx"
          />
          <FeatureCard
            icon={<Globe2 className="w-8 h-8 text-primary" />}
            title={t('features.localization.title')}
            description={t('features.localization.description')}
          />
          <FeatureCard
            icon={<CheckCircle2 className="w-8 h-8 text-primary" />}
            title={t('features.review.title')}
            description={t('features.review.description')}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;