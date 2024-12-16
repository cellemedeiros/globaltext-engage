export interface FreelancerFormData {
  name: string;
  email: string;
  phone: string;
  yearsOfExperience: string;
  languages: string;
  portfolioUrl: string;
  linkedinUrl: string;
  coverLetter: string;
  cv: File | null;
}