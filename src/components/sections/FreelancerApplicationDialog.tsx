import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FreelancerFormFields } from "../forms/freelancer/FreelancerFormFields";
import { FreelancerFormData } from "../forms/freelancer/types";

const FreelancerApplicationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<FreelancerFormData>({
    name: "",
    email: "",
    phone: "",
    yearsOfExperience: "",
    languages: "",
    portfolioUrl: "",
    linkedinUrl: "",
    coverLetter: "",
    cv: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, cv: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.cv) {
        throw new Error("Please upload your CV");
      }

      const fileExt = formData.cv.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("freelancer_cvs")
        .upload(filePath, formData.cv);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("freelancer_cvs")
        .getPublicUrl(filePath);

      const { error: submitError } = await supabase
        .from("freelancer_applications")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          years_of_experience: parseInt(formData.yearsOfExperience),
          languages: formData.languages.split(",").map(lang => lang.trim()),
          cv_url: publicUrl,
          portfolio_url: formData.portfolioUrl || null,
          linkedin_url: formData.linkedinUrl || null,
          cover_letter: formData.coverLetter || null,
        });

      if (submitError) throw submitError;

      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you soon.",
      });

      setIsOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        yearsOfExperience: "",
        languages: "",
        portfolioUrl: "",
        linkedinUrl: "",
        coverLetter: "",
        cv: null,
      });
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Briefcase className="w-4 h-4" />
          Work with Us
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Become a Translator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <FreelancerFormFields
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
            isSubmitting={isSubmitting}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FreelancerApplicationDialog;