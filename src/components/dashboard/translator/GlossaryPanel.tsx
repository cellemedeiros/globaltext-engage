import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Book, Plus, Search, Trash } from "lucide-react";

interface GlossaryTerm {
  id: string;
  source_term: string;
  target_term: string;
  context?: string;
}

const GlossaryPanel = ({ sourceLanguage, targetLanguage }: { sourceLanguage: string; targetLanguage: string }) => {
  const [newSourceTerm, setNewSourceTerm] = useState("");
  const [newTargetTerm, setNewTargetTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: terms, refetch } = useQuery({
    queryKey: ['glossary-terms', sourceLanguage, targetLanguage],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .eq('source_language', sourceLanguage)
        .eq('target_language', targetLanguage)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GlossaryTerm[];
    },
  });

  const filteredTerms = terms?.filter(term => 
    term.source_term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.target_term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addTerm = async () => {
    if (!newSourceTerm.trim() || !newTargetTerm.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to add terms",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('glossary_terms')
      .insert({
        user_id: session.user.id,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        source_term: newSourceTerm.trim(),
        target_term: newTargetTerm.trim(),
      });

    if (error) {
      console.error('Error adding term:', error);
      toast({
        title: "Error",
        description: "Failed to add glossary term",
        variant: "destructive",
      });
      return;
    }

    setNewSourceTerm("");
    setNewTargetTerm("");
    refetch();
    toast({
      title: "Success",
      description: "Glossary term added successfully",
    });
  };

  const deleteTerm = async (id: string) => {
    const { error } = await supabase
      .from('glossary_terms')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete glossary term",
        variant: "destructive",
      });
      return;
    }

    refetch();
    toast({
      title: "Success",
      description: "Glossary term deleted successfully",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Book className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Glossary</h3>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Source term"
          value={newSourceTerm}
          onChange={(e) => setNewSourceTerm(e.target.value)}
        />
        <Input
          placeholder="Target term"
          value={newTargetTerm}
          onChange={(e) => setNewTargetTerm(e.target.value)}
        />
        <Button onClick={addTerm} size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[200px] border rounded-md p-2">
        <div className="space-y-2">
          {filteredTerms?.map((term) => (
            <div
              key={term.id}
              className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
            >
              <div className="flex-1 grid grid-cols-2 gap-4">
                <span>{term.source_term}</span>
                <span>{term.target_term}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTerm(term.id)}
              >
                <Trash className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GlossaryPanel;