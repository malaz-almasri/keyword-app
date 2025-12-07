import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    newProject: 'مشروع جديد',
    projects: 'مشاريعي',
    
    // Hero
    heroTitle: 'مساعدك الإبداعي للإعلانات',
    heroSubtitle: 'توليد إعلانات عالية التحويل باستخدام استراتيجيات التسويق العصبي',
    startNow: 'ابدأ الآن',
    viewProjects: 'عرض المشاريع',
    
    // Content Types
    contentType: 'نوع المحتوى',
    store: 'متجر إلكتروني',
    serviceWebsite: 'موقع خدمات',
    specificProduct: 'منتج محدد',
    specificService: 'خدمة محددة',
    
    // Form Labels
    websiteUrl: 'رابط الموقع',
    extractData: 'تحليل ذكي',
    extracting: 'جاري التحليل...',
    companyName: 'اسم الشركة',
    companyDescription: 'نبذة عن الشركة',
    strengths: 'نقاط القوة',
    addStrength: 'إضافة نقطة قوة',
    uploadImages: 'الصور المرجعية',
    uploadHint: 'ارفع 4 صور للمنتج/الخدمة لضمان تثبيت الهوية',
    
    // Design Settings
    designGoal: 'هدف الحملة',
    directSale: 'بيع مباشر',
    directSaleDesc: 'تحفيز الشراء الفوري',
    brandAwareness: 'وعي بالعلامة',
    brandAwarenessDesc: 'بناء الهوية البصرية',
    educational: 'محتوى تعليمي',
    educationalDesc: 'تقديم قيمة ومعلومات',
    
    // Platform
    platform: 'المنصة والمقاس',
    selectPlatform: 'اختر المنصة',
    
    // Psychological Strategy
    psychStrategy: 'المحرك النفسي',
    selectStrategy: 'اختر الاستراتيجية النفسية لحملتك',
    visualEffect: 'التأثير البصري',
    
    // Generation
    generateImages: 'توليد 3 صور',
    generateVideo: 'توليد فيديو',
    generating: 'جاري التوليد...',
    videoDuration: 'مدة الفيديو',
    seconds: 'ثواني',
    
    // Brand Analysis
    brandAnalysis: 'تحليل العلامة التجارية',
    brandVoice: 'شخصية العلامة',
    colorPalette: 'لوحة الألوان',
    primaryColor: 'اللون الرئيسي',
    secondaryColor: 'اللون الثانوي',
    accentColor: 'لون التمييز',
    
    // Wizard Steps
    step1: 'نوع المحتوى',
    step2: 'التحليل الذكي',
    step3: 'الصور المرجعية',
    step4: 'إعدادات الحملة',
    step5: 'المحرك النفسي',
    next: 'التالي',
    previous: 'السابق',
    createProject: 'إنشاء المشروع',
    
    // Results
    generatedImages: 'الصور المولدة',
    generatedVideos: 'الفيديوهات',
    generatedCaption: 'النص الإعلاني',
    download: 'تحميل',
    noContent: 'لم يتم توليد محتوى بعد',
    copyCaption: 'نسخ النص',
    
    // Mockup
    mockupPreview: 'معاينة واقعية',
    instagramMockup: 'معاينة انستقرام',
    tiktokMockup: 'معاينة تيك توك',
    
    // Loading
    generatingTip: 'نصيحة تسويقية',
    
    // Status
    draft: 'مسودة',
    generating_status: 'جاري التوليد',
    completed: 'مكتمل',
    failed: 'فشل',
    
    // Misc
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    delete: 'حذف',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    back: 'رجوع',
    viewDetails: 'عرض التفاصيل',
    createdAt: 'تاريخ الإنشاء',
    swipeHint: 'اسحب للتنقل بين الصور',
    variations: 'النسخ المختلفة',
  },
  en: {
    // Navigation
    home: 'Home',
    newProject: 'New Project',
    projects: 'My Projects',
    
    // Hero
    heroTitle: 'Your Creative Ad Assistant',
    heroSubtitle: 'Generate high-converting ads using neuromarketing strategies',
    startNow: 'Start Now',
    viewProjects: 'View Projects',
    
    // Content Types
    contentType: 'Content Type',
    store: 'E-commerce Store',
    serviceWebsite: 'Service Website',
    specificProduct: 'Specific Product',
    specificService: 'Specific Service',
    
    // Form Labels
    websiteUrl: 'Website URL',
    extractData: 'Smart Analysis',
    extracting: 'Analyzing...',
    companyName: 'Company Name',
    companyDescription: 'Company Description',
    strengths: 'Strengths',
    addStrength: 'Add Strength',
    uploadImages: 'Reference Images',
    uploadHint: 'Upload 4 product/service images to lock identity',
    
    // Design Settings
    designGoal: 'Campaign Goal',
    directSale: 'Direct Sale',
    directSaleDesc: 'Drive immediate purchases',
    brandAwareness: 'Brand Awareness',
    brandAwarenessDesc: 'Build visual identity',
    educational: 'Educational',
    educationalDesc: 'Provide value & info',
    
    // Platform
    platform: 'Platform & Size',
    selectPlatform: 'Select Platform',
    
    // Psychological Strategy
    psychStrategy: 'Neuro-Engine',
    selectStrategy: 'Choose psychological strategy for your campaign',
    visualEffect: 'Visual Effect',
    
    // Generation
    generateImages: 'Generate 3 Images',
    generateVideo: 'Generate Video',
    generating: 'Generating...',
    videoDuration: 'Video Duration',
    seconds: 'seconds',
    
    // Brand Analysis
    brandAnalysis: 'Brand Analysis',
    brandVoice: 'Brand Voice',
    colorPalette: 'Color Palette',
    primaryColor: 'Primary Color',
    secondaryColor: 'Secondary Color',
    accentColor: 'Accent Color',
    
    // Wizard Steps
    step1: 'Content Type',
    step2: 'Smart Analysis',
    step3: 'Reference Images',
    step4: 'Campaign Settings',
    step5: 'Neuro-Engine',
    next: 'Next',
    previous: 'Previous',
    createProject: 'Create Project',
    
    // Results
    generatedImages: 'Generated Images',
    generatedVideos: 'Videos',
    generatedCaption: 'Ad Caption',
    download: 'Download',
    noContent: 'No content generated yet',
    copyCaption: 'Copy Caption',
    
    // Mockup
    mockupPreview: 'Live Preview',
    instagramMockup: 'Instagram Preview',
    tiktokMockup: 'TikTok Preview',
    
    // Loading
    generatingTip: 'Marketing Tip',
    
    // Status
    draft: 'Draft',
    generating_status: 'Generating',
    completed: 'Completed',
    failed: 'Failed',
    
    // Misc
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    viewDetails: 'View Details',
    createdAt: 'Created At',
    swipeHint: 'Swipe to navigate images',
    variations: 'Variations',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ar');
  
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  const t = (key) => translations[language][key] || key;
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
