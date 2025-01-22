import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminTranslationsOverview = () => {
  const { toast } = useToast();
  const { data: translations, isLoading, refetch } = useQuery({
    queryKey: ['admin-translations-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select(`
          *,
          profiles!translations_user_id_fkey (
            first_name,
            last_name,
            email:id
          ),
          translator:profiles!translations_translator_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching translations:', error);
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    console.log('Setting up real-time subscription for admin translations');
    
    const channel = supabase
      .channel('admin_translations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translations',
        },
        async (payload) => {
          console.log('Translation update received in admin view:', payload);
          await refetch();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Translation",
              description: "A new translation has been submitted",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Translation Updated",
              description: "A translation has been updated",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  const getStatusDisplay = (status: string, adminReviewStatus?: string | null) => {
    if (status === 'pending_admin_review' && adminReviewStatus === 'approved') {
      return {
        label: 'Completed',
        variant: 'default' as const
      };
    }

    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          variant: 'default' as const
        };
      case 'pending_admin_review':
        return {
          label: 'Under Review',
          variant: 'secondary' as const
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          variant: 'secondary' as const
        };
      default:
        return {
          label: 'Pending',
          variant: 'outline' as const
        };
    }
  };

  return (
    <Card className="p-6">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Translator</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {translations?.map((translation) => {
              const status = getStatusDisplay(translation.status, translation.admin_review_status);
              return (
                <TableRow key={translation.id}>
                  <TableCell className="font-medium">
                    {translation.document_name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>
                        {translation.profiles?.first_name} {translation.profiles?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {translation.profiles?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">
                        From: {translation.source_language}
                      </Badge>
                      <Badge variant="outline">
                        To: {translation.target_language}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {translation.translator ? (
                      `${translation.translator.first_name} ${translation.translator.last_name}`
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(translation.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default AdminTranslationsOverview;