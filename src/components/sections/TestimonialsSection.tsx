import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content: "GlobalText has transformed our international marketing efforts. Their attention to cultural nuances is exceptional.",
      rating: 5
    },
    {
      name: "Carlos Rodriguez",
      role: "CEO",
      company: "InnovateMed",
      content: "The quality and speed of translations have helped us expand to new markets seamlessly.",
      rating: 5
    },
    {
      name: "Marie Dubois",
      role: "Content Manager",
      company: "EduGlobal",
      content: "Their localization expertise has made our educational content accessible worldwide.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-secondary/30 scroll-section">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">What Our Clients Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-secondary-dark">{testimonial.content}</p>
                <div className="mt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-primary">{testimonial.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;