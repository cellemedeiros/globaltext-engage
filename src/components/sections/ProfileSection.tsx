import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import ProfileCard from "./profile/ProfileCard";
import SubscriptionCard from "./profile/SubscriptionCard";

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  subscriptions?: Database['public']['Tables']['subscriptions']['Row'] | null;
};

type FreelancerApplication = Database['public']['Tables']['freelancer_applications']['Row'];

const ProfileSection = () => {
  const navigate = useNavigate();

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          subscriptions (*)
        `)
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: application } = useQuery<FreelancerApplication | null>({
    queryKey: ['translator-application'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return null;

      const { data, error } = await supabase
        .from('freelancer_applications')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle();

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

  const showTranslatorButton = profile.role === 'client' && !application;
  const applicationPending = !!application && !profile.is_approved_translator;

  return (
    <div className="space-y-6">
      <ProfileCard
        profile={profile}
        onApplyTranslator={handleTranslatorApplication}
        showTranslatorButton={showTranslatorButton}
        applicationPending={applicationPending}
      />

      {profile.role === 'client' && (
        <SubscriptionCard
          subscription={profile.subscriptions || null}
          onChoosePlan={() => navigate('/payment')}
        />
      )}
    </div>
  );
};

export default ProfileSection;