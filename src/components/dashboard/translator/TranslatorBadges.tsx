import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Award } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Badge {
  id: string;
  name: string;
  description: string;
  type: string;
  threshold: number | null;
  image_url: string | null;
  earned_at: string;
}

interface TranslatorBadgeResponse {
  badge_id: string;
  earned_at: string;
  badges: {
    id: string;
    name: string;
    description: string;
    type: string;
    threshold: number | null;
    image_url: string | null;
  }
}

const TranslatorBadges = () => {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['translator-badges'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('translator_badges')
        .select(`
          badge_id,
          earned_at,
          badges (
            id,
            name,
            description,
            type,
            threshold,
            image_url
          )
        `)
        .eq('translator_id', session.user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching badges:', error);
        return [];
      }

      // Transform the data to match the Badge interface
      return (data as unknown as TranslatorBadgeResponse[]).map(item => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        type: item.badges.type,
        threshold: item.badges.threshold,
        image_url: item.badges.image_url,
        earned_at: item.earned_at
      }));
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Translator Badges</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Translator Badges</h2>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-4 p-4 bg-muted rounded-lg"
            >
              {badge.image_url ? (
                <img
                  src={badge.image_url}
                  alt={badge.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Award className="w-12 h-12 text-primary" />
              )}
              <div>
                <h3 className="font-medium">{badge.name}</h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Earned: {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TranslatorBadges;