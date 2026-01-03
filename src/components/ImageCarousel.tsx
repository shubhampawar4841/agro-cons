'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showArrowsOnHover?: boolean; // If true, arrows show on hover. If false, always visible
}

export default function ImageCarousel({ images, alt, className = '', showArrowsOnHover = true }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<boolean[]>(new Array(images.length).fill(false));
  const [isInteracting, setIsInteracting] = useState(!showArrowsOnHover); // Always show if not hover mode

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (index: number) => {
    setImageError((prev) => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => showArrowsOnHover && setIsInteracting(true)}
      onMouseLeave={() => showArrowsOnHover && setIsInteracting(false)}
      onClick={() => showArrowsOnHover && setIsInteracting(true)}
    >
      {!imageError[currentIndex] && images[currentIndex] ? (
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-contain"
          onError={() => handleImageError(currentIndex)}
          unoptimized={images[currentIndex].includes('supabase.co')}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      )}

      {/* Navigation Arrows - Only show when interacting and more than 1 image */}
      {images.length > 1 && isInteracting && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-opacity z-10"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-opacity z-10"
            aria-label="Next image"
          >
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Indicators - Only show when interacting and more than 1 image */}
      {images.length > 1 && isInteracting && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter - Always show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

