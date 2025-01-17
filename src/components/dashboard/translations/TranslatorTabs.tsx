import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "@/integrations/supabase/types";
import TranslationItem from "./TranslationItem";
import EmptyTranslationState from "./EmptyTranslationState";

type Translation = Database['public']['Tables']['translations']['Row'];

interface TranslatorTabsProps {
  translations: Translation[];
  role: 'translator';
  onUpdate: () => void;
}

const TranslatorTabs = ({ translations, role, onUpdate }: TranslatorTabsProps) => {
  // Update the filter to include 'in_progress' status
  const inProgressTranslations = translations.filter(t => 
    t.status === 'in_progress' || 
    t.status === 'pending_admin_review'
  );
  
  const completedTranslations = translations.filter(t => 
    t.status === 'completed' || 
    (t.status === 'pending_admin_review' && t.admin_review_status === 'approved')
  );

  console.log('Filtered translations:', {
    all: translations,
    inProgress: inProgressTranslations,
    completed: completedTranslations
  });

  return (
    <Tabs defaultValue="in-progress" className="space-y-4">
      <TabsList>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      
      <TabsContent value="in-progress">
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {inProgressTranslations.length === 0 ? (
              <EmptyTranslationState type="in-progress" />
            ) : (
              inProgressTranslations.map((translation) => (
                <TranslationItem 
                  key={translation.id}
                  translation={translation}
                  role={role}
                  onUpdate={onUpdate}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="completed">
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {completedTranslations.length === 0 ? (
              <EmptyTranslationState type="completed" />
            ) : (
              completedTranslations.map((translation) => (
                <TranslationItem 
                  key={translation.id}
                  translation={translation}
                  role={role}
                  onUpdate={onUpdate}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default TranslatorTabs;