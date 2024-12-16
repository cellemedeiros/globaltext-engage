import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const ContactSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
        title: "Message sent!",
        description: "We'll get back to you soon.",
      });
      
      // Clear form
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-700 mb-8">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white"
              disabled={isSubmitting}
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white"
              disabled={isSubmitting}
            />
            <Textarea
              placeholder="Your Message"
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
              {isSubmitting ? "Sending..." : "Send Message"}
              <Mail className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;