import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Store,
  Globe,
  Package,
  Briefcase,
  Upload,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Link as LinkIcon,
  Target,
  Megaphone,
  GraduationCap,
  Palette,
  Info,
  Sparkles,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function NewProjectPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
  
  // Wizard state
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  // Form state
  const [contentType, setContentType] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [strengths, setStrengths] = useState(['']);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [designGoal, setDesignGoal] = useState('');
  const [platform, setPlatform] = useState('');
  const [psychStrategy, setPsychStrategy] = useState('');
  const [showStrategyInfo, setShowStrategyInfo] = useState(null);
  
  // Brand colors
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  
  // Data from API
  const [strategies, setStrategies] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [strategiesRes, platformsRes] = await Promise.all([
          axios.get(`${API}/strategies`),
          axios.get(`${API}/platforms`),
        ]);
        setStrategies(strategiesRes.data);
        setPlatforms(platformsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  
  const contentTypes = [
    { id: 'store', icon: Store, labelAr: 'متجر إلكتروني', labelEn: 'E-commerce Store' },
    { id: 'service_website', icon: Globe, labelAr: 'موقع خدمات', labelEn: 'Service Website' },
    { id: 'specific_product', icon: Package, labelAr: 'منتج محدد', labelEn: 'Specific Product' },
    { id: 'specific_service', icon: Briefcase, labelAr: 'خدمة محددة', labelEn: 'Specific Service' },
  ];
  
  const designGoals = [
    { id: 'direct_sale', icon: Target, labelAr: 'بيع مباشر', labelEn: 'Direct Sale', descAr: 'تحفيز الشراء الفوري', descEn: 'Drive immediate purchases' },
    { id: 'brand_awareness', icon: Megaphone, labelAr: 'وعي بالعلامة', labelEn: 'Brand Awareness', descAr: 'بناء الهوية البصرية', descEn: 'Build visual identity' },
    { id: 'educational', icon: GraduationCap, labelAr: 'محتوى تعليمي', labelEn: 'Educational', descAr: 'تقديم قيمة ومعلومات', descEn: 'Provide value & info' },
  ];
  
  const handleExtract = async () => {
    if (!websiteUrl) return;
    
    setIsExtracting(true);
    try {
      const response = await axios.post(`${API}/scrape`, { url: websiteUrl });
      setScrapedData(response.data);
      
      if (response.data.title) {
        setCompanyName(response.data.title);
      }
      if (response.data.description) {
        setCompanyDescription(response.data.description);
      }
      if (response.data.services?.length > 0) {
        setStrengths(response.data.services.slice(0, 4));
      }
      
      // Set brand colors if extracted
      if (response.data.brand_analysis) {
        const brand = response.data.brand_analysis;
        if (brand.primary_color) setPrimaryColor(brand.primary_color);
        if (brand.secondary_color) setSecondaryColor(brand.secondary_color);
        if (brand.accent_color) setAccentColor(brand.accent_color);
      }
      
      toast.success(language === 'ar' ? 'تم تحليل الموقع بنجاح' : 'Website analyzed successfully');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل تحليل الموقع' : 'Failed to analyze website');
    } finally {
      setIsExtracting(false);
    }
  };
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 4) {
      toast.error(language === 'ar' ? 'يمكنك رفع 4 صور كحد أقصى' : 'Maximum 4 images allowed');
      return;
    }
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await axios.post(`${API}/upload`, formData);
        setUploadedImages(prev => [...prev, response.data.url]);
      } catch (error) {
        toast.error(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image');
      }
    }
  };
  
  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const addStrength = () => {
    if (strengths.length < 6) {
      setStrengths([...strengths, '']);
    }
  };
  
  const removeStrength = (index) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };
  
  const updateStrength = (index, value) => {
    const newStrengths = [...strengths];
    newStrengths[index] = value;
    setStrengths(newStrengths);
  };
  
  const isStepValid = () => {
    switch (step) {
      case 1:
        return contentType !== '';
      case 2:
        return companyName !== '' && companyDescription !== '';
      case 3:
        return true;
      case 4:
        return designGoal !== '' && platform !== '';
      case 5:
        return psychStrategy !== '';
      default:
        return false;
    }
  };
  
  const handleCreateProject = async () => {
    if (!isStepValid()) return;
    
    setIsCreating(true);
    try {
      const projectData = {
        content_type: contentType,
        company_name: companyName,
        company_description: companyDescription,
        strengths: strengths.filter(s => s.trim() !== ''),
        images: uploadedImages,
        design_goal: designGoal,
        platform: platform,
        psychological_strategy_id: psychStrategy,
        scraped_data: scrapedData,
        brand_colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
        },
        language: language,
      };
      
      const response = await axios.post(`${API}/projects`, projectData);
      toast.success(language === 'ar' ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully');
      navigate(`/projects/${response.data.id}`);
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل إنشاء المشروع' : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };
  
  const stepLabels = [
    { labelAr: 'نوع المحتوى', labelEn: 'Content Type' },
    { labelAr: 'التحليل الذكي', labelEn: 'Smart Analysis' },
    { labelAr: 'الصور المرجعية', labelEn: 'Reference Images' },
    { labelAr: 'إعدادات الحملة', labelEn: 'Campaign' },
    { labelAr: 'المحرك النفسي', labelEn: 'Neuro-Engine' },
  ];
  
  const getStrategyIcon = (iconName) => {
    const icons = {
      'hook': '🎣',
      'scale': '⚖️',
      'megaphone': '📢',
      'lightbulb': '💡',
      'credit-card': '💳',
      'shield-alert': '🛡️',
      'puzzle': '🧩',
      'book-open': '📖',
      'heart-handshake': '🤝',
      'message-circle': '💬',
      'users': '👥',
      'star': '⭐',
      'gift': '🎁',
      'check-circle': '✅',
      'clock': '⏰',
    };
    return icons[iconName] || '🎯';
  };
  
  const getBrandVoiceLabel = (voice) => {
    const labels = {
      'luxury': { ar: 'فاخر', en: 'Luxury' },
      'playful': { ar: 'مرح', en: 'Playful' },
      'formal': { ar: 'رسمي', en: 'Formal' },
      'friendly': { ar: 'ودود', en: 'Friendly' },
    };
    const label = labels[voice] || labels['friendly'];
    return language === 'ar' ? label.ar : label.en;
  };
  
  return (
    <div className="page-enter page-enter-active min-h-screen py-6 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" data-testid="wizard-title">
              {language === 'ar' ? 'مشروع جديد' : 'New Project'}
            </h1>
            <span className="text-sm text-muted-foreground">
              {step} / {totalSteps}
            </span>
          </div>
          
          <Progress value={(step / totalSteps) * 100} className="h-2" />
          
          <div className="flex justify-between mt-4">
            {stepLabels.map((label, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${index + 1 <= step ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                <div
                  className={`wizard-step ${index + 1 < step ? 'completed' : index + 1 === step ? 'active' : 'pending'}`}
                >
                  {index + 1 < step ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block">
                  {language === 'ar' ? label.labelAr : label.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          {/* Step 1: Content Type */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold" data-testid="step1-title">
                {t('contentType')}
              </h2>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'اختر نوع المحتوى الذي تريد إنشاء إعلانات له' : 'Choose the type of content you want to create ads for'}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id)}
                      className={`strategy-card p-6 rounded-xl flex flex-col items-center gap-3 ${contentType === type.id ? 'selected' : 'bg-secondary'}`}
                      data-testid={`content-type-${type.id}`}
                    >
                      <Icon className="w-8 h-8" />
                      <span className="font-medium text-center">
                        {language === 'ar' ? type.labelAr : type.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Step 2: Smart Analysis */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold" data-testid="step2-title">
                {t('step2')}
              </h2>
              
              {/* Website URL extraction */}
              <div className="space-y-3">
                <label className="text-sm font-medium">{t('websiteUrl')}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="ps-10 h-12"
                      data-testid="website-url-input"
                    />
                  </div>
                  <Button
                    onClick={handleExtract}
                    disabled={!websiteUrl || isExtracting}
                    className="h-12 px-6 gap-2"
                    data-testid="extract-btn"
                  >
                    {isExtracting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isExtracting ? t('extracting') : t('extractData')}
                  </Button>
                </div>
              </div>
              
              {/* Brand Analysis Results */}
              {scrapedData?.brand_analysis && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {t('brandAnalysis')}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">{t('brandVoice')}</span>
                      <p className="font-medium">{getBrandVoiceLabel(scrapedData.brand_analysis.brand_voice)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">{t('colorPalette')}</span>
                      <div className="flex gap-1 mt-1">
                        {scrapedData.brand_analysis.color_palette?.slice(0, 5).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('companyName')} *</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-12"
                  data-testid="company-name-input"
                />
              </div>
              
              {/* Company Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('companyDescription')} *</label>
                <Textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows={4}
                  data-testid="company-description-input"
                />
              </div>
              
              {/* Brand Colors */}
              <div className="space-y-3">
                <label className="text-sm font-medium">{t('colorPalette')}</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">{t('primaryColor')}</span>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">{t('secondaryColor')}</span>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-10 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">{t('accentColor')}</span>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10 font-mono text-sm" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Strengths */}
              <div className="space-y-3">
                <label className="text-sm font-medium">{t('strengths')}</label>
                {strengths.map((strength, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={strength}
                      onChange={(e) => updateStrength(index, e.target.value)}
                      placeholder={`${language === 'ar' ? 'نقطة قوة' : 'Strength'} ${index + 1}`}
                      className="h-12"
                      data-testid={`strength-input-${index}`}
                    />
                    {strengths.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeStrength(index)} className="h-12 w-12">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {strengths.length < 6 && (
                  <Button variant="outline" onClick={addStrength} className="w-full h-12" data-testid="add-strength-btn">
                    <Plus className="w-4 h-4 me-2" />
                    {t('addStrength')}
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Step 3: Reference Images */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold" data-testid="step3-title">
                {t('uploadImages')}
              </h2>
              <p className="text-muted-foreground">
                {t('uploadHint')}
              </p>
              
              <label className="upload-zone block p-8 rounded-xl cursor-pointer text-center" data-testid="upload-zone">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'انقر لرفع الصور المرجعية (4 صور كحد أقصى)' : 'Click to upload reference images (max 4)'}
                </span>
              </label>
              
              {uploadedImages.length > 0 && (
                <div className="image-preview-grid">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                      <img src={`${process.env.REACT_APP_BACKEND_URL}${url}`} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 end-2 p-1.5 rounded-full bg-destructive text-destructive-foreground"
                        data-testid={`remove-image-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {scrapedData?.images?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {language === 'ar' ? 'صور مستخرجة من الموقع' : 'Images from website'}
                  </p>
                  <div className="image-preview-grid">
                    {scrapedData.images.slice(0, 4).map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                        <img src={url} alt={`Scraped ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Campaign Settings */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold" data-testid="step4-title">
                  {t('designGoal')}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {designGoals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => setDesignGoal(goal.id)}
                        className={`strategy-card p-5 rounded-xl flex flex-col items-center gap-2 ${designGoal === goal.id ? 'selected' : 'bg-secondary'}`}
                        data-testid={`design-goal-${goal.id}`}
                      >
                        <Icon className="w-8 h-8" />
                        <span className="font-medium">
                          {language === 'ar' ? goal.labelAr : goal.labelEn}
                        </span>
                        <span className="text-xs text-muted-foreground text-center">
                          {language === 'ar' ? goal.descAr : goal.descEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('platform')}</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`size-option ${platform === p.id ? 'selected' : ''}`}
                      data-testid={`platform-${p.id}`}
                    >
                      <span className="platform-badge mb-2">{p.aspect}</span>
                      <span className="text-sm font-medium">{language === 'ar' ? p.name : p.name_en}</span>
                      <span className="text-xs text-muted-foreground">{p.width} × {p.height}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 5: Neuro-Engine */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold" data-testid="step5-title">
                {t('psychStrategy')}
              </h2>
              <p className="text-muted-foreground">
                {t('selectStrategy')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pe-2">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="relative">
                    <button
                      onClick={() => setPsychStrategy(strategy.id)}
                      className={`strategy-card w-full p-4 rounded-xl flex items-start gap-3 text-start ${psychStrategy === strategy.id ? 'selected' : 'bg-secondary'}`}
                      data-testid={`strategy-${strategy.id}`}
                    >
                      <span className="text-2xl">{getStrategyIcon(strategy.icon)}</span>
                      <div className="flex-1">
                        <div className="font-medium">
                          {language === 'ar' ? strategy.name_ar : strategy.name_en}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {language === 'ar' ? strategy.description_ar : strategy.description_en}
                        </div>
                      </div>
                    </button>
                    
                    {/* Info button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStrategyInfo(showStrategyInfo === strategy.id ? null : strategy.id);
                      }}
                      className="absolute top-2 end-2 p-1.5 rounded-full bg-muted text-muted-foreground"
                      data-testid={`strategy-info-${strategy.id}`}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    
                    {/* Visual instructions popup */}
                    {showStrategyInfo === strategy.id && (
                      <div className="absolute z-10 top-full mt-2 start-0 end-0 bg-card border border-border rounded-xl p-4 shadow-lg">
                        <h4 className="font-medium text-sm mb-2">{t('visualEffect')}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {strategy.visual_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 gap-4">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="h-12 px-6 rounded-xl" data-testid="prev-btn">
              <BackArrow className="w-4 h-4 me-2" />
              {t('previous')}
            </Button>
          ) : (
            <div />
          )}
          
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!isStepValid()} className="h-12 px-6 rounded-xl" data-testid="next-btn">
              {t('next')}
              <Arrow className="w-4 h-4 ms-2" />
            </Button>
          ) : (
            <Button onClick={handleCreateProject} disabled={!isStepValid() || isCreating} className="h-12 px-8 rounded-xl" data-testid="create-project-btn">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
              {t('createProject')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
