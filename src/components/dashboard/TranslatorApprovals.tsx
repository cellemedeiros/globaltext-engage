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

const TranslatorApprovals = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: profiles, refetch } = useQuery({
    queryKey: ["translator-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, is_approved_translator")
        .eq("role", "translator");

      if (error) throw error;
      return data;
    },
  });

  const handleApproveTranslator = async (userId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved_translator: true })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translator has been approved",
      });
      
      refetch();
    } catch (error) {
      console.error("Error approving translator:", error);
      toast({
        title: "Error",
        description: "Failed to approve translator",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeApproval = async (userId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved_translator: false })
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage Translators</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles?.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>{profile.id}</TableCell>
              <TableCell>
                {profile.is_approved_translator ? "Approved" : "Pending"}
              </TableCell>
              <TableCell>
                {profile.is_approved_translator ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleRevokeApproval(profile.id)}
                    disabled={isUpdating}
                  >
                    Revoke Approval
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleApproveTranslator(profile.id)}
                    disabled={isUpdating}
                  >
                    Approve
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TranslatorApprovals;