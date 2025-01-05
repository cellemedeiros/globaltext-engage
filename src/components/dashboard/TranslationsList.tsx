import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationItem from "./translations/TranslationItem";
import { useTranslations } from "@/hooks/useTranslations";
import { Database } from "@/integrations/supabase/types";

type Translation = Database['public']['Tables']['translations']['Row'];

interface TranslationsListProps {
  role?: 'client' | 'translator' | 'admin';
  isLoading?: boolean;
}

const TranslationsList = ({ role = 'client', isLoading = false }: TranslationsListProps) => {
  const title = role === 'translator' ? 'Translations to Review' : 'Recent Translations';
  const { toast } = useToast();
  const { data: translations, isLoading: translationsLoading, refetch } = useTranslations(role);

  // Subscribe to real-time updates for translations
  useEffect(() => {
    const channel = supabase
      .channel('translations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translations',
        },
        (payload) => {
          console.log('Translation update:', payload);
          // Refresh translations data when changes occur
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (isLoading || translationsLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {title}
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!translations?.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {title}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileX className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No translations yet</h3>
          <p className="text-muted-foreground max-w-sm">
            {role === 'translator' 
              ? "You haven't been assigned any translations yet. Check back later."
              : "You haven't submitted any translations yet. Start by uploading a document."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          {title}
        </h2>
      </div>
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {translations.map((translation) => (
            <TranslationItem 
              key={translation.id}
              translation={translation}
              role={role}
              onUpdate={() => {
                toast({
                  title: "Success",
                  description: "Translation updated successfully",
                });
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TranslationsList;