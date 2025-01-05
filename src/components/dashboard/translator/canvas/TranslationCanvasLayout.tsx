import { motion } from "framer-motion";

interface TranslationCanvasLayoutProps {
  children: React.ReactNode;
}

const TranslationCanvasLayout = ({ children }: TranslationCanvasLayoutProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default TranslationCanvasLayout;