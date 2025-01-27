import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Settings, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TranslationProject {
  id: string;
  name: string;
  description: string | null;
  source_language: string;
  target_language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  word_count: number;
  created_at: string;
}

const DashboardLayout = () => {
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['translation-projects'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('translation_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TranslationProject[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Translation Projects</h1>
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Project Card */}
        <Card 
          className="p-6 border-2 border-dashed border-gray-200 hover:border-primary cursor-pointer flex flex-col items-center justify-center text-center space-y-4"
          onClick={() => navigate('/projects/new')}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Create New Project</h3>
            <p className="text-sm text-muted-foreground">Start a new translation project</p>
          </div>
        </Card>

        {/* Existing Projects */}
        {projects?.map((project) => (
          <Card 
            key={project.id} 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                project.status === 'failed' ? 'bg-red-100 text-red-800' :
                project.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </div>
            </div>

            <h3 className="font-semibold mb-2 line-clamp-1">{project.name}</h3>
            
            {project.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                <span>{project.source_language} → {project.target_language}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardLayout;
