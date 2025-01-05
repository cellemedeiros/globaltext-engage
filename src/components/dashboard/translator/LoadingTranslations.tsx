import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LoadingTranslations = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default LoadingTranslations;