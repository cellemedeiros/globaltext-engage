import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import TranslationItem from "./translations/TranslationItem";
import { useTranslations } from "@/hooks/useTranslations";
import EmptyTranslationState from "./translations/EmptyTranslationState";
import TranslatorTabs from "./translations/TranslatorTabs";

interface TranslationsListProps {
  role?: 'client' | 'translator' | 'admin';
  isLoading?: boolean;
}

const TranslationsList = ({ role = 'client', isLoading = false }: TranslationsListProps) => {
  const title = role === 'translator' ? 'Translations' : 'Recent Translations';
  const { toast } = useToast();
  const { data: translations, isLoading: translationsLoading, refetch } = useTranslations(role);

  useEffect(() => {
    console.log('TranslationsList mounted with role:', role);
    console.log('Current translations:', translations);

    // Subscribe to real-time updates for translations
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
          console.log('Translation update received:', payload);
          // Refresh the translations list when changes occur
          refetch();
          
          // Show toast notification for relevant events
          if (payload.eventType === 'INSERT' && role === 'translator') {
            toast({
              title: "New Translation Available",
              description: "A new document is available for translation",
            });
          } else if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const translatedFilePath = payload.new.translated_file_path;
            
            // Notify client when translation is completed and file is uploaded
            if (role === 'client' && newStatus === 'completed' && translatedFilePath) {
              toast({
                title: "Translation Completed",
                description: "Your document has been translated and is ready for download",
              });
            }
            
            // Notify translator when a translation is claimed
            if (role === 'translator' && payload.new.translator_id && !payload.old.translator_id) {
              toast({
                title: "Translation Claimed",
                description: "You have successfully claimed this translation",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, role, toast, translations]);

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
        <EmptyTranslationState type="default" />
      </Card>
    );
  }

  if (role === 'translator') {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {title}
          </h2>
        </div>
        <TranslatorTabs 
          translations={translations}
          role={role}
          onUpdate={() => {
            toast({
              title: "Success",
              description: "Translation updated successfully",
            });
            refetch();
          }}
        />
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
                refetch();
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TranslationsList;