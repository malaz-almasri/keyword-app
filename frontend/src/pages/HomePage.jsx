import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { 
  Sparkles, 
  Image, 
  Video, 
  Brain, 
  Target, 
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Zap,
  Palette,
  Smartphone,
} from 'lucide-react';

export default function HomePage() {
  const { t, language } = useLanguage();
  const Arrow = language === 'ar' ? ArrowLeft : ArrowRight;
  
  const features = [
    {
      icon: Brain,
      titleAr: '15 استراتيجية نفسية',
      titleEn: '15 Neuro Strategies',
      descAr: 'تعليمات بصرية دقيقة لكل استراتيجية',
      descEn: 'Precise visual instructions for each strategy',
    },
    {
      icon: Image,
      titleAr: '3 نسخ مختلفة',
      titleEn: '3 Variations',
      descAr: 'توليد ثلاث نسخ لكل إعلان للمقارنة',
      descEn: 'Generate three versions for A/B testing',
    },
    {
      icon: Video,
      titleAr: 'فيديو Sora 2',
      titleEn: 'Sora 2 Video',
      descAr: 'فيديوهات 5-10 ثواني Loop',
      descEn: '5-10 second loop videos',
    },
    {
      icon: Palette,
      titleAr: 'تحليل الهوية',
      titleEn: 'Brand Analysis',
      descAr: 'استخراج الألوان وشخصية العلامة',
      descEn: 'Extract colors & brand voice',
    },
    {
      icon: Smartphone,
      titleAr: 'معاينة واقعية',
      titleEn: 'Live Mockup',
      descAr: 'شاهد إعلانك داخل انستقرام وتيكتوك',
      descEn: 'Preview in Instagram & TikTok',
    },
    {
      icon: TrendingUp,
      titleAr: 'تقليل Ad Fatigue',
      titleEn: 'Reduce Ad Fatigue',
      descAr: 'محتوى متنوع يحافظ على التفاعل',
      descEn: 'Diverse content maintains engagement',
    },
  ];
  
  const strategies = [
    { icon: '🎣', nameAr: 'الخطاف', nameEn: 'Hook' },
    { icon: '⚖️', nameAr: 'المقارنة', nameEn: 'Comparison' },
    { icon: '🧩', nameAr: 'المشكلة/الحل', nameEn: 'Problem/Solution' },
    { icon: '⏰', nameAr: 'الندرة', nameEn: 'Scarcity' },
    { icon: '⭐', nameAr: 'الدليل', nameEn: 'Social Proof' },
    { icon: '🎁', nameAr: 'المقايضة', nameEn: 'Reciprocity' },
  ];
  
  return (
    <div className="page-enter page-enter-active">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 md:py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -end-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -start-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-border text-sm font-medium">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>{language === 'ar' ? 'Gemini Nano Banana + Sora 2' : 'Gemini Nano Banana + Sora 2'}</span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight" data-testid="hero-title">
            {t('heroTitle')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
          
          {/* Strategies Preview */}
          <div className="flex flex-wrap items-center justify-center gap-3 py-4">
            {strategies.map((strategy, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full text-sm"
              >
                <span>{strategy.icon}</span>
                <span>{language === 'ar' ? strategy.nameAr : strategy.nameEn}</span>
              </span>
            ))}
            <span className="text-muted-foreground text-sm">+9</span>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/new" data-testid="start-now-btn">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-semibold gap-2">
                {t('startNow')}
                <Arrow className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/projects" data-testid="view-projects-btn">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg">
                {t('viewProjects')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="features-title">
            {language === 'ar' ? 'ما يميز NeuroAd' : 'What Makes NeuroAd Special'}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'أدوات متقدمة لإنشاء إعلانات تحقق نتائج'
              : 'Advanced tools to create ads that convert'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="feature-card p-6 md:p-8 rounded-2xl bg-card border border-border"
                  data-testid={`feature-card-${index}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {language === 'ar' ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? feature.descAr : feature.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* How it Works */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {language === 'ar' ? 'كيف يعمل؟' : 'How It Works'}
          </h2>
          
          <div className="space-y-8">
            {[
              {
                step: 1,
                titleAr: 'أدخل رابط موقعك',
                titleEn: 'Enter Your URL',
                descAr: 'يحلل النظام هوية علامتك وألوانها تلقائياً',
                descEn: 'System analyzes your brand identity and colors automatically',
              },
              {
                step: 2,
                titleAr: 'ارفع صور المنتج',
                titleEn: 'Upload Product Images',
                descAr: '4 صور مرجعية لتثبيت الهوية البصرية',
                descEn: '4 reference images to lock visual identity',
              },
              {
                step: 3,
                titleAr: 'اختر الاستراتيجية النفسية',
                titleEn: 'Choose Neuro Strategy',
                descAr: '15 استراتيجية بتعليمات بصرية دقيقة',
                descEn: '15 strategies with precise visual instructions',
              },
              {
                step: 4,
                titleAr: 'احصل على حزمة إعلانية',
                titleEn: 'Get Your Ad Package',
                descAr: '3 صور + فيديو + نص إعلاني + هاشتاجات',
                descEn: '3 images + video + caption + hashtags',
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {language === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            {language === 'ar' 
              ? 'ابدأ في إنشاء إعلانات تحقق نتائج' 
              : 'Start Creating Ads That Convert'}
          </h2>
          <p className="text-lg opacity-80">
            {language === 'ar'
              ? 'استخدم قوة التسويق العصبي لزيادة معدل التحويل'
              : 'Use the power of neuromarketing to boost conversion rates'}
          </p>
          <Link to="/new" data-testid="cta-start-btn">
            <Button 
              size="lg" 
              variant="secondary" 
              className="rounded-full px-8 py-6 text-lg font-semibold mt-4"
            >
              {t('startNow')}
              <Arrow className="w-5 h-5 ms-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
