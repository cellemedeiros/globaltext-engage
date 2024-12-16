import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProfileSection = () => {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*, subscriptions(*)')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: application } = useQuery({
    queryKey: ['translator-application'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return null;

      const { data, error } = await supabase
        .from('freelancer_applications')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const handleTranslatorApplication = () => {
    if (!application) {
      navigate('/?apply=true');
    } else if (!profile?.is_approved_translator) {
      navigate('/translator-dashboard');
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {profile.first_name} {profile.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium">{profile.country || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{profile.phone || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{profile.role}</p>
            </div>
          </div>

          {profile.role === 'client' && !application && (
            <div className="mt-6">
              <Button onClick={handleTranslatorApplication} variant="outline">
                Apply as Translator
              </Button>
            </div>
          )}

          {application && !profile.is_approved_translator && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                Your translator application is pending approval. We'll notify you once it's reviewed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {profile.role === 'client' && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.subscriptions ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">{profile.subscriptions.plan_name}</p>
                <p className="text-sm text-muted-foreground">Words Remaining</p>
                <p className="font-medium">{profile.subscriptions.words_remaining || 0}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No active subscription</p>
                <Button onClick={() => navigate('/payment')}>
                  Choose a Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileSection;