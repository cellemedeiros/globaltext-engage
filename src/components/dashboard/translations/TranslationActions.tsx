import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TranslationActionsProps {
  translationId: string;
  status: string;
  onUpdate: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const TranslationActions = ({
  translationId,
  status,
  onUpdate,
  onAccept,
  onDecline,
}: TranslationActionsProps) => {
  const { toast } = useToast();

  const handleFinishProject = async () => {
    try {
      const { error } = await supabase
        .from('translations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', translationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project marked as completed",
      });
      onUpdate();
    } catch (error) {
      console.error('Error finishing project:', error);
      toast({
        title: "Error",
        description: "Failed to complete project",
        variant: "destructive"
      });
    }
  };

  if (status === 'pending') {
    return (
      <div className="flex gap-4">
        <Button 
          onClick={onAccept}
          className="flex-1"
          variant="default"
        >
          Accept Translation
        </Button>
        <Button 
          onClick={onDecline}
          className="flex-1"
          variant="outline"
        >
          Decline
        </Button>
      </div>
    );
  }

  if (status === 'in_progress') {
    return (
      <Button 
        onClick={handleFinishProject}
        className="w-full"
        variant="default"
      >
        Finish Project
      </Button>
    );
  }

  return null;
};

export default TranslationActions;