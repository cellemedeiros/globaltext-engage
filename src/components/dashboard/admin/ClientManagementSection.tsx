import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { AdminUserList } from "@supabase/auth-helpers-shared";

interface ClientProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  subscription?: {
    plan_name: string;
    status: string;
    words_remaining: number;
  } | null;
}

const ClientManagementSection = () => {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      // First get all client profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          subscription:subscriptions(
            plan_name,
            status,
            words_remaining
          )
        `)
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      // Get emails for these users
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) {
        console.error('Error fetching user emails:', usersError);
        throw usersError;
      }

      const users = (usersData?.users || []) as AdminUserList['users'];

      // Map emails to profiles
      return profiles.map(profile => ({
        ...profile,
        email: users.find(u => u.id === profile.id)?.email,
        subscription: profile.subscription?.[0] // Get the first subscription if exists
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Client Management</h2>
      <div className="space-y-4">
        {clients?.map((client: ClientProfile) => (
          <Card key={client.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {client.first_name} {client.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {client.subscription ? (
                    <>
                      <span className="text-green-600">
                        {client.subscription.plan_name} Plan
                      </span>
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {client.subscription.words_remaining} words remaining
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No active subscription</span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientManagementSection;