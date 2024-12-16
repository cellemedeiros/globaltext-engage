import { Card } from "@/components/ui/card";

interface RoleSelectionProps {
  onRoleSelect: (role: 'client' | 'translator') => void;
}

const RoleSelection = ({ onRoleSelect }: RoleSelectionProps) => {
  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to GlobalText</h2>
        <p className="text-sm text-muted-foreground">Choose how you want to use GlobalText</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => onRoleSelect('client')}
        >
          <div className="text-center">
            <h3 className="font-semibold mb-2">Client</h3>
            <p className="text-sm text-muted-foreground">Get your content translated</p>
          </div>
        </Card>
        <Card 
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => onRoleSelect('translator')}
        >
          <div className="text-center">
            <h3 className="font-semibold mb-2">Translator</h3>
            <p className="text-sm text-muted-foreground">Work as a translator</p>
          </div>
        </Card>
      </div>
    </>
  );
};

export default RoleSelection;