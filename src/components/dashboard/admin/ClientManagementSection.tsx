import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  subscription?: Database['public']['Tables']['subscriptions']['Row'] | null;
  email?: string;
};

const ClientManagementSection = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user found");

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          subscription:subscriptions(
            plan_name,
            status,
            expires_at
          )
        `)
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get emails from auth.users for these profiles
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const emailMap = new Map(authUsers?.users.map(user => [user.id, user.email]));
      
      return (profiles as Profile[]).map(profile => ({
        ...profile,
        email: emailMap.get(profile.id) || ''
      }));
    },
  });

  const filteredClients = clients?.filter(client => 
    client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Client Management</h2>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Current Plan</TableHead>
              <TableHead>Plan Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading clients...
                </TableCell>
              </TableRow>
            ) : filteredClients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              filteredClients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    {client.first_name} {client.last_name}
                  </TableCell>
                  <TableCell>{client.country || 'Not specified'}</TableCell>
                  <TableCell>{client.subscription?.plan_name || 'No plan'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.subscription?.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.subscription?.status || 'No subscription'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {client.subscription?.expires_at 
                      ? new Date(client.subscription.expires_at).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ClientManagementSection;