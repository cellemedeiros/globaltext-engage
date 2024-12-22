import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  additionalInfo?: string;
  delay?: number;
}

const FeatureCard = ({ icon, title, description, additionalInfo, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
    >
      <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border border-gray-100">
        <CardContent className="p-0 space-y-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
          {additionalInfo && (
            <p className="text-sm text-gray-500">{additionalInfo}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;