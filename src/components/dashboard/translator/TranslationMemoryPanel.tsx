import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Database, List, Search } from "lucide-react";

interface TranslationMemory {
  id: string;
  source_segment: string;
  target_segment: string;
  last_used_at: string;
}

const TranslationMemoryPanel = ({ sourceLanguage, targetLanguage }: { sourceLanguage: string; targetLanguage: string }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: memories } = useQuery({
    queryKey: ['translation-memories', sourceLanguage, targetLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_memories')
        .select('*')
        .eq('source_language', sourceLanguage)
        .eq('target_language', targetLanguage)
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      return data as TranslationMemory[];
    },
  });

  const filteredMemories = memories?.filter(memory =>
    memory.source_segment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.target_segment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Translation Memory</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search translations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[200px] border rounded-md p-2">
        <div className="space-y-2">
          {filteredMemories?.map((memory) => (
            <div
              key={memory.id}
              className="p-2 hover:bg-muted rounded-md cursor-pointer"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <List className="w-4 h-4 text-muted-foreground inline mr-2" />
                  <span>{memory.source_segment}</span>
                </div>
                <span>{memory.target_segment}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranslationMemoryPanel;