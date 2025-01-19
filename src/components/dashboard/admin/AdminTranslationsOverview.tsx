import React from "react";
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

const AdminTranslationsOverview = () => {
  const { data: translations, isLoading } = useQuery({
    queryKey: ['admin-translations-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select(`
          *,
          profiles!translations_user_id_fkey (
            first_name,
            last_name,
            email:id(email)
          ),
          translators:profiles!translations_translator_id_fkey (
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

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Translations Overview</h2>
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
            {translations?.map((translation) => (
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
                  <Badge
                    variant={
                      translation.status === 'completed'
                        ? 'default'
                        : translation.status === 'pending'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      translation.status === 'completed'
                        ? 'bg-green-500 hover:bg-green-600'
                        : translation.status === 'pending'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : ''
                    }
                  >
                    {translation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {translation.translators ? (
                    `${translation.translators.first_name} ${translation.translators.last_name}`
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(translation.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default AdminTranslationsOverview;