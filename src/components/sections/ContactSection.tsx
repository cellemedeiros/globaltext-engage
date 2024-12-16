import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

const ContactSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          { name, email, message }
        ]);

      if (error) throw error;

      toast({
        title: t('contact.form.success'),
        description: t('contact.form.successMessage'),
      });
      
      // Clear form
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast({
        title: t('contact.form.error'),
        description: t('contact.form.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-secondary-light scroll-section">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">{t('contact.title')}</h2>
          <p className="text-gray-700 mb-8">
            {t('contact.subtitle')}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={t('contact.form.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white"
              disabled={isSubmitting}
            />
            <Input
              type="email"
              placeholder={t('contact.form.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white"
              disabled={isSubmitting}
            />
            <Textarea
              placeholder={t('contact.form.message')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="min-h-[150px] bg-white"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              className="w-full md:w-auto hover:scale-105 transition-transform"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
              <Mail className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;