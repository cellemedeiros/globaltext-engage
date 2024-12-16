import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Globe, AlertCircle } from "lucide-react";

const TranslatorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTranslatorStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_approved_translator')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'translator') {
        navigate('/');
        toast({
          title: "Access Denied",
          description: "This area is only for translators.",
          variant: "destructive",
        });
        return;
      }

      setIsApproved(profile?.is_approved_translator || false);
      setIsLoading(false);
    };

    checkTranslatorStatus();
  }, [navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isApproved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Approval Pending</h1>
            <p className="text-muted-foreground mb-6">
              Your translator application is currently under review. We'll notify you once your account has been approved.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Globe className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Translator Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Projects</h2>
          <p className="text-muted-foreground">No projects available at the moment.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
          <p className="text-muted-foreground">You have no active projects.</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Completed Projects</h2>
          <p className="text-muted-foreground">No completed projects yet.</p>
        </Card>
      </div>
    </div>
  );
};

export default TranslatorDashboard;