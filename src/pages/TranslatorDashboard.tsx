import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TranslatorProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  role: string;
  is_approved_translator: boolean;
  created_at: string;
  email: string | null;
};

type User = {
  id: string;
  email: string;
};

const TranslatorApprovals = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: translators, isLoading: isLoadingTranslators } = useQuery<TranslatorProfile[]>({
    queryKey: ['translators'],
    queryFn: async () => {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'translator')
        .order('created_at', { ascending: false });

      if (profilesError) {
        toast({
          title: "Error fetching translators",
          description: profilesError.message,
          variant: "destructive",
        });
        throw profilesError;
      }

      // Then get emails for each profile from auth.users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        toast({
          title: "Error fetching user emails",
          description: usersError.message,
          variant: "destructive",
        });
        throw usersError;
      }

      // Create a properly typed map of user IDs to emails
      const userEmailMap = new Map(
        (users as User[]).map(user => [user.id, user.email] as [string, string])
      );

      // Transform the data to match our TranslatorProfile type
      const transformedData: TranslatorProfile[] = (profilesData || []).map((profile: any) => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        country: profile.country,
        role: profile.role,
        is_approved_translator: profile.is_approved_translator,
        created_at: profile.created_at,
        email: userEmailMap.get(profile.id) || null,
      }));

      return transformedData;
    },
  });

  const handleRevokeApproval = async (userId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved_translator: false, role: 'client' })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translator approval has been revoked",
      });
      
      refetch();
    } catch (error) {
      console.error("Error revoking approval:", error);
      toast({
        title: "Error",
        description: "Failed to revoke translator approval",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) {
    return (
      <div className="text-red-500">
        Error loading translators: {(error as Error).message}
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading translators...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Active Translators</h2>
      {translators && translators.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {translators.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.email}</TableCell>
                <TableCell>{profile.role}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => handleRevokeApproval(profile.id)}
                    disabled={isUpdating || profile.id === "37665cdd-1fdd-40d0-b485-35148c159bed"}
                  >
                    Revoke Approval
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-gray-500">No active translators found.</div>
      )}
    </div>
  );
};

export default TranslatorApprovals;