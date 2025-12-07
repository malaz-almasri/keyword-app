import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play } from 'lucide-react';

export function ImageCarousel({ images, backendUrl }) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50 && currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    if (touchStart - touchEnd < -50 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative">
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="relative aspect-square overflow-hidden rounded-xl bg-muted"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(${language === 'ar' ? currentIndex * 100 : -currentIndex * 100}%)` }}
        >
          {images.map((url, index) => (
            <div key={index} className="min-w-full h-full flex-shrink-0">
              <img
                src={`${backendUrl}${url}`}
                alt={`Generated ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Always visible when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className={`absolute start-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white shadow-lg ${currentIndex === 0 ? 'opacity-40' : 'opacity-100'}`}
              disabled={currentIndex === 0}
              data-testid="carousel-prev"
            >
              {language === 'ar' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </button>
            <button
              onClick={goToNext}
              className={`absolute end-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white shadow-lg ${currentIndex === images.length - 1 ? 'opacity-40' : 'opacity-100'}`}
              disabled={currentIndex === images.length - 1}
              data-testid="carousel-next"
            >
              {language === 'ar' ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-accent w-6'
                  : 'bg-muted-foreground/30'
              }`}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function InstagramMockup({ imageUrl, backendUrl, companyName }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-border max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            {companyName?.charAt(0) || 'A'}
          </div>
          <span className="font-semibold text-sm">{companyName || 'Brand'}</span>
        </div>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Image */}
      <div className="aspect-square bg-muted">
        <img
          src={`${backendUrl}${imageUrl}`}
          alt="Instagram preview"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6" />
            <MessageCircle className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
          <Bookmark className="w-6 h-6" />
        </div>
        <div className="text-sm">
          <span className="font-semibold">1,234 likes</span>
        </div>
      </div>
    </div>
  );
}

export function TikTokMockup({ videoUrl, imageUrl, backendUrl, companyName }) {
  return (
    <div className="relative bg-black rounded-xl overflow-hidden max-w-[280px] mx-auto" style={{ aspectRatio: '9/16' }}>
      {/* Video/Image Preview */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            src={`${backendUrl}${videoUrl}`}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
          />
        ) : imageUrl ? (
          <img
            src={`${backendUrl}${imageUrl}`}
            alt="TikTok preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 flex">
        {/* Right side actions */}
        <div className="absolute end-3 bottom-24 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs mt-1">45.2K</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs mt-1">892</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs mt-1">1.2K</span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 start-3 end-16">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold">
              {companyName?.charAt(0) || 'A'}
            </div>
            <span className="text-white font-semibold text-sm">@{companyName?.toLowerCase().replace(/\s/g, '') || 'brand'}</span>
          </div>
          <p className="text-white text-xs line-clamp-2">
            #إعلان #تسويق #عرض_خاص
          </p>
        </div>

        {/* Play button overlay */}
        {videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingScreen({ tips, language }) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tips.length]);

  const currentTip = tips[currentTipIndex];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      {/* Animated loader */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
        <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-muted rounded-full"></div>
        <div className="absolute inset-2 border-4 border-accent/50 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>

      {/* Status text */}
      <h2 className="text-xl font-bold mb-2">
        {language === 'ar' ? 'جاري إنشاء الإعلان...' : 'Creating your ad...'}
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        {language === 'ar' ? 'قد يستغرق هذا بضع دقائق' : 'This may take a few minutes'}
      </p>

      {/* Marketing tip */}
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md text-center">
        <span className="text-xs font-medium text-accent uppercase tracking-wide">
          {language === 'ar' ? 'نصيحة تسويقية' : 'Marketing Tip'}
        </span>
        <p className="mt-3 text-lg font-medium transition-opacity duration-500">
          {language === 'ar' ? currentTip?.ar : currentTip?.en}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-6">
        {tips.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentTipIndex ? 'bg-accent w-6' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
