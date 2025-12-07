import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import {
  FolderOpen,
  Plus,
  Trash2,
  Eye,
  Image,
  Video,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProjectsPage() {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API}/projects`);
        setProjects(response.data);
      } catch (error) {
        toast.error(language === 'ar' ? 'فشل تحميل المشاريع' : 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [language]);
  
  // Delete project
  const handleDelete = async (projectId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success(language === 'ar' ? 'تم حذف المشروع' : 'Project deleted');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل حذف المشروع' : 'Failed to delete project');
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        labelAr: 'مسودة',
        labelEn: 'Draft',
        class: 'bg-muted text-muted-foreground',
      },
      generating: {
        labelAr: 'جاري التوليد',
        labelEn: 'Generating',
        class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      },
      generating_video: {
        labelAr: 'جاري توليد الفيديو',
        labelEn: 'Generating Video',
        class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
      completed: {
        labelAr: 'مكتمل',
        labelEn: 'Completed',
        class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      failed: {
        labelAr: 'فشل',
        labelEn: 'Failed',
        class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {language === 'ar' ? config.labelAr : config.labelEn}
      </span>
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="page-enter page-enter-active min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" data-testid="projects-title">
              {t('projects')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? `${projects.length} مشروع`
                : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          
          <Link to="/new" data-testid="new-project-link">
            <Button className="rounded-xl h-12 px-6">
              <Plus className="w-4 h-4 me-2" />
              {t('newProject')}
            </Button>
          </Link>
        </div>
        
        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'ar' ? 'لا توجد مشاريع بعد' : 'No projects yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'ar'
                ? 'ابدأ بإنشاء مشروعك الأول'
                : 'Start by creating your first project'}
            </p>
            <Link to="/new">
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 me-2" />
                {t('newProject')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="gallery-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-card rounded-2xl border border-border overflow-hidden"
                data-testid={`project-card-${project.id}`}
              >
                {/* Preview Image */}
                <div className="aspect-video bg-muted relative">
                  {project.generated_images?.length > 0 ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${project.generated_images[0]}`}
                      alt={project.company_name}
                      className="w-full h-full object-cover"
                    />
                  ) : project.images?.length > 0 ? (
                    <img
                      src={project.images[0].startsWith('http') ? project.images[0] : `${process.env.REACT_APP_BACKEND_URL}${project.images[0]}`}
                      alt={project.company_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <div className="absolute top-3 end-3">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {project.company_name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.company_description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      <span>{project.generated_images?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      <span>{project.generated_videos?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full h-10 rounded-xl"
                        data-testid={`view-project-${project.id}`}
                      >
                        <Eye className="w-4 h-4 me-2" />
                        {t('viewDetails')}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      className="h-10 w-10 text-destructive"
                      data-testid={`delete-project-${project.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
