import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type ProfileData = Database['public']['Tables']['profiles']['Row'];

interface ProfileCardProps {
  profile: ProfileData;
  onApplyTranslator: () => void;
  showTranslatorButton: boolean;
  applicationPending: boolean;
}

const ProfileCard = ({ 
  profile, 
  onApplyTranslator, 
  showTranslatorButton,
  applicationPending 
}: ProfileCardProps) => {
  return (
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

        {showTranslatorButton && (
          <div className="mt-6">
            <Button onClick={onApplyTranslator} variant="outline">
              Apply as Translator
            </Button>
          </div>
        )}

        {applicationPending && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              Your translator application is pending approval. We'll notify you once it's reviewed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;