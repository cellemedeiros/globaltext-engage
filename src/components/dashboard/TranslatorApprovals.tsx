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
  role: string;
  is_approved_translator: boolean;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

// Only the admin translator ID is protected from having approval revoked
const PROTECTED_TRANSLATOR_ID = "37665cdd-1fdd-40d0-b485-35148c159bed";

const TranslatorApprovals = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: profiles, refetch, isLoading, error } = useQuery({
    queryKey: ["translator-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved_translator", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching translator profiles:', error);
        throw error;
      }

      return data as TranslatorProfile[];
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
      {profiles && profiles.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  {profile.first_name} {profile.last_name}
                </TableCell>
                <TableCell>{profile.role}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => handleRevokeApproval(profile.id)}
                    disabled={isUpdating || profile.id === PROTECTED_TRANSLATOR_ID}
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