import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Award, Trophy, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface Badge {
  id: string;
  name: string;
  description: string;
  type: string;
  threshold: number | null;
  image_url: string | null;
  earned_at: string;
}

const TranslatorBadges = () => {
  const { data: badges, isLoading } = useQuery({
    queryKey: ['translator-badges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

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
        .eq('translator_id', user.id);

      if (error) {
        console.error('Error fetching badges:', error);
        throw error;
      }

      return data.map(item => ({
        ...item.badges,
        earned_at: item.earned_at
      })) as Badge[];
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Your Achievements</h2>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges?.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {badge.image_url ? (
                    <img 
                      src={badge.image_url} 
                      alt={badge.name} 
                      className="w-12 h-12"
                    />
                  ) : (
                    <Award className="w-12 h-12 text-primary" />
                  )}
                  <div>
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned on {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {(!badges || badges.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
              <Star className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No badges yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Complete translations to earn badges and showcase your achievements!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TranslatorBadges;