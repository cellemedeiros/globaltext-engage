import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TranslatorProfile = {
  id: string;
  role: string;
  is_approved_translator: boolean;
  first_name: string | null;
  last_name: string | null;
};

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
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading translators: {(error as Error).message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
            <p>Loading translators...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Active Translators</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {profiles && profiles.length > 0 ? (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </p>
                    {profile.id === PROTECTED_TRANSLATOR_ID ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevokeApproval(profile.id)}
                  disabled={isUpdating || profile.id === PROTECTED_TRANSLATOR_ID}
                  className="w-[140px]"
                >
                  {profile.id === PROTECTED_TRANSLATOR_ID ? (
                    "Admin Protected"
                  ) : (
                    "Revoke Approval"
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No active translators found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslatorApprovals;