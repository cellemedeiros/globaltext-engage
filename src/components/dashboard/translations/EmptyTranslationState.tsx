import { FileX, CheckCircle } from "lucide-react";

interface EmptyTranslationStateProps {
  type: 'in-progress' | 'completed' | 'default';
}

const EmptyTranslationState = ({ type }: EmptyTranslationStateProps) => {
  const Icon = type === 'completed' ? CheckCircle : FileX;
  
  const getMessage = () => {
    switch (type) {
      case 'in-progress':
        return {
          title: "No translations in progress",
          description: "You don't have any translations in progress at the moment."
        };
      case 'completed':
        return {
          title: "No completed translations",
          description: "You haven't completed any translations yet."
        };
      default:
        return {
          title: "No translations yet",
          description: "You haven't submitted any translations yet. Start by uploading a document."
        };
    }
  };

  const message = getMessage();

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{message.title}</h3>
      <p className="text-muted-foreground max-w-sm">
        {message.description}
      </p>
    </div>
  );
};

export default EmptyTranslationState;