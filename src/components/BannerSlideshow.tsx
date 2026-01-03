'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface BannerSlideshowProps {
  images: string[];
  autoPlayInterval?: number;
}

export default function BannerSlideshow({
  images,
  autoPlayInterval = 5000,
}: BannerSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  /* 🔁 Auto play */
  useEffect(() => {
    if (paused || images.length <= 1) return;

    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(id);
  }, [paused, images.length, autoPlayInterval]);

  const next = useCallback(
    () => setCurrentIndex((i) => (i + 1) % images.length),
    [images.length]
  );

  const prev = useCallback(
    () => setCurrentIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  /* 📱 Swipe handlers */
  const onTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) {
      setPaused(false);
      return;
    }

    const deltaX = touchStartX - e.changedTouches[0].clientX;
    const SWIPE_DISTANCE = 50;

    if (deltaX > SWIPE_DISTANCE) next();
    if (deltaX < -SWIPE_DISTANCE) prev();

    setTouchStartX(null);
    setTimeout(() => setPaused(false), 800);
  };

  if (!images || images.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-gray-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* SLIDES */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full"
        >
<div className="relative w-full h-[38vh] sm:h-[55vh] md:h-[600px] lg:h-[700px]">
<Image
              src={images[currentIndex]}
              alt={`Banner ${currentIndex + 1}`}
              fill
              priority={currentIndex === 0}
    className="object-contain"
              sizes="100vw"
              quality={90}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 🖥 DESKTOP ARROWS ONLY */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 
                       z-20 w-12 h-12 lg:w-14 lg:h-14 bg-white/80 backdrop-blur-sm 
                       rounded-full items-center justify-center shadow-lg 
                       hover:bg-white transition text-3xl text-gray-700"
            aria-label="Previous banner"
          >
            ‹
          </button>

          <button
            onClick={next}
            className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 
                       z-20 w-12 h-12 lg:w-14 lg:h-14 bg-white/80 backdrop-blur-sm 
                       rounded-full items-center justify-center shadow-lg 
                       hover:bg-white transition text-3xl text-gray-700"
            aria-label="Next banner"
          >
            ›
          </button>
        </>
      )}

      {/* 🖥 DESKTOP DOTS ONLY */}
      {images.length > 1 && (
        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex
                  ? 'w-10 h-3 bg-white shadow-md'
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ⏳ PROGRESS BAR */}
      {!paused && images.length > 1 && (
        <motion.div
          key={currentIndex}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-0.5 sm:h-1 bg-white/70 z-20"
        />
      )}
    </section>
  );
}
