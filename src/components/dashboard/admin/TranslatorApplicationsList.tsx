import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Application {
  id: string;
  name: string;
  email: string;
  years_of_experience: number;
  languages: string[];
  status: string;
  created_at: string;
}

const TranslatorApplicationsList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: applications, refetch } = useQuery({
    queryKey: ['translator-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('freelancer_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Application[];
    }
  });

  const handleApplicationUpdate = async (id: string, status: 'approved' | 'rejected', notes: string = '') => {
    try {
      const { error: updateError } = await supabase
        .from('freelancer_applications')
        .update({
          status,
          reviewed_by: (await supabase.auth.getSession()).data.session?.user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes
        })
        .eq('id', id);

      if (updateError) throw updateError;

      if (status === 'approved') {
        // Update the user's profile to mark them as an approved translator
        const { data: application } = await supabase
          .from('freelancer_applications')
          .select('email')
          .eq('id', id)
          .single();

        if (application?.email) {
          const { data: userData } = await supabase
            .from('profiles')
            .update({
              role: 'translator',
              is_approved_translator: true
            })
            .eq('id', (await supabase.auth.getSession()).data.session?.user.id);
        }
      }

      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });

      refetch();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <h2 className="text-2xl font-bold">Translator Applications</h2>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Languages</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications?.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.name}</TableCell>
              <TableCell>{app.email}</TableCell>
              <TableCell>{app.years_of_experience} years</TableCell>
              <TableCell>{app.languages.join(', ')}</TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell className="space-x-2">
                {app.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApplicationUpdate(app.id, 'approved')}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApplicationUpdate(app.id, 'rejected')}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TranslatorApplicationsList;