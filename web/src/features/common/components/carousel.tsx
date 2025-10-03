import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  images: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | '100% 100%';
  backgroundPosition?: string;
  useMobileMarquee?: boolean;
  mobileBreakpoint?: number;
}

export function Carousel({
  images,
  autoSlide = true,
  autoSlideInterval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  backgroundSize = 'cover',
  backgroundPosition = 'center',
  useMobileMarquee = true,
  mobileBreakpoint = 768,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= mobileBreakpoint);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [mobileBreakpoint]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoSlide) return;

    const interval = setTimeout(nextSlide, autoSlideInterval);
    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, nextSlide, currentIndex]);

  if (images.length === 0) return null;

  // Mobile marquee view
  if (isMobile && useMobileMarquee) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`} style={{ maxHeight: 200, height: 200 }}>
        {/* Mobile Marquee Images */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="min-w-full h-full relative overflow-hidden flex items-center"
            >
              <div
                key={`${index}-${currentIndex}`}
                className={`h-full flex ${index === currentIndex ? 'animate-marquee-x' : ''}`}
                style={{ width: 'max-content' }}
              >
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="h-full max-w-[696969px] w-auto flex-shrink-0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots for mobile */}
        {showDots && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 cursor-pointer ${index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={{ maxHeight: 325, height: 325 }}>
      {/* Images */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="min-w-full h-full"
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: backgroundSize,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: backgroundPosition,
            }}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200 z-30 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200 z-30 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 cursor-pointer ${index === currentIndex
                ? 'bg-white'
                : 'bg-white/50 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
