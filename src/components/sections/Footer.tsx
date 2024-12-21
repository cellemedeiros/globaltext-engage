import { motion } from "framer-motion";
import { Globe, Linkedin, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
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
          backgroundImage: "radial-gradient(circle at center, rgba(30,174,219,0.2) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Globe className="w-6 h-6 text-primary" />
              GlobalText
            </div>
            <p className="text-gray-400">
              Enterprise translation and localization solutions for global businesses.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-lg">Solutions</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Enterprise</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Small Business</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Developers</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-lg">Connect</h3>
            <div className="flex gap-4">
              {[
                { icon: Linkedin, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400"
        >
          <p>© 2024 GlobalText. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;