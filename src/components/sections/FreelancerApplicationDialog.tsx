import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FreelancerApplicationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    yearsOfExperience: "",
    languages: "",
    portfolioUrl: "",
    linkedinUrl: "",
    coverLetter: "",
    cv: null as File | null,
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

      // Upload CV to storage
      const fileExt = formData.cv.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("freelancer_cvs")
        .upload(filePath, formData.cv);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("freelancer_cvs")
        .getPublicUrl(filePath);

      // Submit application
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Become a Translator</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                required
                min="0"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages (comma-separated) *</Label>
            <Input
              id="languages"
              name="languages"
              required
              placeholder="e.g., English, Spanish, French"
              value={formData.languages}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv">CV/Resume *</Label>
            <Input
              id="cv"
              name="cv"
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                type="url"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FreelancerApplicationDialog;