import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { ImageCarousel, InstagramMockup, TikTokMockup, LoadingScreen } from '../components/AdComponents';
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Download,
  Loader2,
  Sparkles,
  Trash2,
  Clock,
  Target,
  Brain,
  Copy,
  Check,
  Smartphone,
  Play,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [videoDuration, setVideoDuration] = useState('8');
  const [videoSize, setVideoSize] = useState('portrait');
  const [strategies, setStrategies] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [marketingTips, setMarketingTips] = useState([]);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [showMockup, setShowMockup] = useState('instagram');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, strategiesRes, platformsRes, tipsRes] = await Promise.all([
          axios.get(`${API}/projects/${id}`),
          axios.get(`${API}/strategies`),
          axios.get(`${API}/platforms`),
          axios.get(`${API}/marketing-tips`),
        ]);
        setProject(projectRes.data);
        setStrategies(strategiesRes.data);
        setPlatforms(platformsRes.data);
        setMarketingTips(tipsRes.data);
      } catch (error) {
        toast.error(language === 'ar' ? 'فشل تحميل المشروع' : 'Failed to load project');
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, language, navigate]);
  
  const handleGenerateImages = async () => {
    setIsGeneratingImages(true);
    try {
      const response = await axios.post(`${API}/generate-content`, {
        project_id: id,
        variation_count: 3,
        custom_instructions: customInstructions || null,
      });
      
      if (response.data.success) {
        const projectRes = await axios.get(`${API}/projects/${id}`);
        setProject(projectRes.data);
        toast.success(language === 'ar' ? 'تم توليد 3 صور بنجاح' : '3 images generated successfully');
      }
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل توليد الصور' : 'Failed to generate images');
    } finally {
      setIsGeneratingImages(false);
    }
  };
  
  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    toast.info(language === 'ar' ? 'جاري توليد الفيديو... قد يستغرق 2-10 دقائق' : 'Generating video... This may take 2-10 minutes');
    
    try {
      const response = await axios.post(`${API}/generate-video`, {
        project_id: id,
        duration: parseInt(videoDuration),
        video_size: videoSize,
        custom_instructions: customInstructions || null,
      });
      
      if (response.data.success) {
        const projectRes = await axios.get(`${API}/projects/${id}`);
        setProject(projectRes.data);
        toast.success(language === 'ar' ? 'تم توليد الفيديو بنجاح' : 'Video generated successfully');
      }
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل توليد الفيديو' : 'Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/projects/${id}`);
      toast.success(language === 'ar' ? 'تم حذف المشروع' : 'Project deleted');
      navigate('/projects');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل حذف المشروع' : 'Failed to delete project');
    }
  };
  
  const copyCaption = async () => {
    const caption = project?.generated_captions?.[0];
    if (caption) {
      const text = language === 'ar' ? caption.caption_ar : caption.caption_en;
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        setCopiedCaption(true);
        setTimeout(() => setCopiedCaption(false), 2000);
        toast.success(language === 'ar' ? '\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0646\u0635' : 'Caption copied');
      } catch (err) {
        toast.error(language === 'ar' ? '\u0641\u0634\u0644 \u0646\u0633\u062e \u0627\u0644\u0646\u0635' : 'Failed to copy');
      }
    }
  };
  
  const getStrategy = () => strategies.find(s => s.id === project?.psychological_strategy_id);
  const getPlatform = () => platforms.find(p => p.id === project?.platform);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Loading screen during generation
  if (isGeneratingImages || isGeneratingVideo) {
    return <LoadingScreen tips={marketingTips} language={language} />;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!project) return null;
  
  const strategy = getStrategy();
  const platform = getPlatform();
  const caption = project.generated_captions?.[0];
  
  return (
    <div className="page-enter page-enter-active min-h-screen py-6 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/projects">
              <Button variant="ghost" size="icon" className="rounded-xl" data-testid="back-btn">
                <BackArrow className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold" data-testid="project-title">
                {project.company_name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDate(project.created_at)}</span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive" data-testid="delete-btn">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated Images with Carousel */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  {t('generatedImages')}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {project.generated_images?.length || 0} {t('variations')}
                </span>
              </div>
              
              {project.generated_images?.length > 0 ? (
                <>
                  <ImageCarousel
                    images={project.generated_images}
                    backendUrl={process.env.REACT_APP_BACKEND_URL}
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    {t('swipeHint')}
                  </p>
                  
                  {/* Download buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {project.generated_images.map((url, index) => (
                      <a
                        key={index}
                        href={`${process.env.REACT_APP_BACKEND_URL}${url}`}
                        download
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-full text-xs font-medium"
                        data-testid={`download-image-${index}`}
                      >
                        <Download className="w-3 h-3" />
                        {language === 'ar' ? `صورة ${index + 1}` : `Image ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('noContent')}</p>
                </div>
              )}
            </div>
            
            {/* Live Mockup Preview */}
            {project.generated_images?.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    {t('mockupPreview')}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMockup('instagram')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        showMockup === 'instagram' ? 'bg-foreground text-background' : 'bg-muted'
                      }`}
                    >
                      Instagram
                    </button>
                    <button
                      onClick={() => setShowMockup('tiktok')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        showMockup === 'tiktok' ? 'bg-foreground text-background' : 'bg-muted'
                      }`}
                    >
                      TikTok
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center py-4">
                  {showMockup === 'instagram' ? (
                    <InstagramMockup
                      imageUrl={project.generated_images[0]}
                      backendUrl={process.env.REACT_APP_BACKEND_URL}
                      companyName={project.company_name}
                    />
                  ) : (
                    <TikTokMockup
                      imageUrl={project.generated_images[0]}
                      videoUrl={project.generated_videos?.[0]}
                      backendUrl={process.env.REACT_APP_BACKEND_URL}
                      companyName={project.company_name}
                    />
                  )}
                </div>
              </div>
            )}
            
            {/* Generated Videos */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  {t('generatedVideos')}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {project.generated_videos?.length || 0}
                </span>
              </div>
              
              {project.generated_videos?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {project.generated_videos.map((url, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden bg-muted">
                      <video
                        src={`${process.env.REACT_APP_BACKEND_URL}${url}`}
                        controls
                        loop
                        className="w-full"
                        data-testid={`video-${index}`}
                      />
                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL}${url}`}
                        download
                        className="absolute top-3 end-3 p-2 bg-black/50 rounded-full"
                        data-testid={`download-video-${index}`}
                      >
                        <Download className="w-5 h-5 text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('noContent')}</p>
                </div>
              )}
            </div>
            
            {/* Generated Caption */}
            {caption && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">
                    {t('generatedCaption')}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCaption}
                    className="gap-2"
                    data-testid="copy-caption-btn"
                  >
                    {copiedCaption ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCaption ? (language === 'ar' ? 'تم النسخ' : 'Copied') : t('copyCaption')}
                  </Button>
                </div>
                
                <div className="bg-muted rounded-xl p-4 whitespace-pre-wrap text-sm">
                  {language === 'ar' ? caption.caption_ar : caption.caption_en}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-lg">
                {language === 'ar' ? 'معلومات المشروع' : 'Project Info'}
              </h2>
              
              <p className="text-sm text-muted-foreground">
                {project.company_description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                {strategy && (
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-accent" />
                    <span className="text-sm">
                      {language === 'ar' ? strategy.name_ar : strategy.name_en}
                    </span>
                  </div>
                )}
                {platform && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-sm">
                      {language === 'ar' ? platform.name : platform.name_en}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Brand Colors */}
              {project.brand_colors && (
                <div>
                  <span className="text-xs text-muted-foreground">{t('colorPalette')}</span>
                  <div className="flex gap-2 mt-1">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: project.brand_colors.primary }}
                      title={project.brand_colors.primary}
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: project.brand_colors.secondary }}
                      title={project.brand_colors.secondary}
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: project.brand_colors.accent }}
                      title={project.brand_colors.accent}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Generation Controls */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-lg">
                {language === 'ar' ? 'توليد محتوى جديد' : 'Generate New Content'}
              </h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'ar' ? 'تعليمات إضافية (اختياري)' : 'Custom Instructions (optional)'}
                </label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder={language === 'ar' ? 'أضف تعليمات خاصة...' : 'Add custom instructions...'}
                  rows={3}
                  data-testid="custom-instructions-input"
                />
              </div>
              
              <Button
                onClick={handleGenerateImages}
                disabled={isGeneratingImages || isGeneratingVideo}
                className="w-full h-12 rounded-xl gap-2"
                data-testid="generate-images-btn"
              >
                <Sparkles className="w-4 h-4" />
                {t('generateImages')}
              </Button>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('videoDuration')}</label>
                <Select value={videoDuration} onValueChange={setVideoDuration}>
                  <SelectTrigger className="h-12" data-testid="video-duration-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 {t('seconds')}</SelectItem>
                    <SelectItem value="8">8 {t('seconds')}</SelectItem>
                    <SelectItem value="12">12 {t('seconds')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'ar' ? 'نسبة الفيديو' : 'Video Aspect'}</label>
                <Select value={videoSize} onValueChange={setVideoSize}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">9:16 ({language === 'ar' ? 'عمودي' : 'Portrait'})</SelectItem>
                    <SelectItem value="square">1:1 ({language === 'ar' ? 'مربع' : 'Square'})</SelectItem>
                    <SelectItem value="landscape">16:9 ({language === 'ar' ? 'أفقي' : 'Landscape'})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleGenerateVideo}
                disabled={isGeneratingImages || isGeneratingVideo}
                variant="outline"
                className="w-full h-12 rounded-xl gap-2"
                data-testid="generate-video-btn"
              >
                <Play className="w-4 h-4" />
                {t('generateVideo')}
              </Button>
            </div>
            
            {/* Uploaded Reference Images */}
            {project.images?.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="font-semibold text-lg">
                  {language === 'ar' ? 'الصور المرجعية' : 'Reference Images'}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {project.images.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={url.startsWith('http') ? url : `${process.env.REACT_APP_BACKEND_URL}${url}`}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
