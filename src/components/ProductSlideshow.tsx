'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  weight: string;
  image_url: string;
  images?: string[];
}

interface Props {
  products: Product[];
  autoPlayInterval?: number;
}

/* 🎨 Backgrounds inspired by product packaging */
const bgMap: Record<string, string> = {
    'organic-beetroot-powder':
      'bg-[radial-gradient(circle_at_25%_30%,rgba(190,24,93,0.12),transparent_60%),linear-gradient(180deg,#fff7f9,#ffffff)]',
  
    'moringa-powder':
      'bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.14),transparent_60%),linear-gradient(180deg,#f6fbf8,#ffffff)]',
  
    'organic-ashwagandha-powder':
      'bg-[radial-gradient(circle_at_30%_30%,rgba(132,204,22,0.12),transparent_60%),linear-gradient(180deg,#fbfcf7,#ffffff)]',
  
    'organic-toor-dal':
      'bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.14),transparent_60%),linear-gradient(180deg,#fffaf2,#ffffff)]',
  };
  

const marketingCopy: Record<string, { tagline: string; points: string[] }> = {
  'organic-beetroot-powder': {
    tagline: 'Vibrant Health in Every Spoon',
    points: [
      '❤️ Improves heart health naturally',
      '💪 Boosts stamina & endurance',
      '🛡️ Rich in antioxidants',
      '🩸 Supports blood circulation',
    ],
  },
  'organic-ashwagandha-powder': {
    tagline: 'Ancient Wisdom for Daily Balance',
    points: [
      '🧘 Reduces stress & anxiety',
      '🌙 Improves sleep quality',
      '🧠 Enhances focus & clarity',
      '⚡ Sustains daily energy',
    ],
  },
  'moringa-powder': {
    tagline: 'The Daily Dose of Green Energy',
    points: [
      '🌿 Nutrient-dense superfood',
      '💪 Strengthens immunity',
      '🦴 Supports bone health',
      '✨ Natural detox support',
    ],
  },
  'organic-toor-dal': {
    tagline: 'Everyday Nutrition for Indian Homes',
    points: [
      '🥗 High plant protein',
      '🌾 Rich in dietary fiber',
      '🍛 Ideal for daily meals',
      '🌱 Unpolished & chemical-free',
    ],
  },
};

export default function ProductSlideshow({
  products,
  autoPlayInterval = 3000,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (paused || products.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % products.length),
      autoPlayInterval
    );
    return () => clearInterval(id);
  }, [paused, products.length, autoPlayInterval]);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % products.length),
    [products.length]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + products.length) % products.length),
    [products.length]
  );

  if (!products.length) return null;

  const product = products[index];
  const image = product.images?.[0] || product.image_url;
  const bg = bgMap[product.slug] || 'bg-gradient-to-br from-green-50 to-white';
  const copy = marketingCopy[product.slug];

  const handleTouchStart = (e: React.TouchEvent) => {
    setPaused(true); // Pause auto-play when user starts swiping
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(0); // Reset touch end
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setPaused(false); // Resume auto-play if no swipe detected
      return;
    }
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Minimum swipe distance in pixels

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left - go to next
        next();
      } else {
        // Swiped right - go to previous
        prev();
      }
    }
    
    // Reset touch values
    setTouchStart(0);
    setTouchEnd(0);
    
    // Resume auto-play after a short delay
    setTimeout(() => {
      setPaused(false);
    }, 1000);
  };

  return (
    <section
      className={`relative w-full min-h-[500px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] ${bg} overflow-hidden`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* LEFT INFO (CLEAN, FLOWING) - Mobile First */}
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
              className="order-2 lg:order-1 text-center lg:text-left"
            >
              <p className="uppercase tracking-wide text-green-700 font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">
                Featured Product
              </p>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                {product.name}
              </h1>

              <p className="text-base sm:text-lg text-green-800 font-medium mb-6 sm:mb-8">
                {copy?.tagline}
              </p>

              <ul className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10">
                {copy?.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3 justify-center lg:justify-start">
                    <span className="text-lg sm:text-xl leading-none flex-shrink-0">{p[0]}</span>
                    <span className="text-left">{p.slice(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center lg:justify-start">
                <Link
                  href={`/products/${product.slug}`}
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition text-sm sm:text-base text-center min-h-[44px] flex items-center justify-center touch-manipulation"
                >
                  Shop Now
                </Link>
                <Link
                  href="/products"
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-green-700 text-green-700 font-semibold hover:bg-green-50 transition text-sm sm:text-base text-center min-h-[44px] flex items-center justify-center touch-manipulation"
                >
                  Explore All
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT PRODUCT HERO - Mobile First */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center order-1 lg:order-2"
          >
            <div className="relative h-[280px] sm:h-[380px] md:h-[450px] lg:h-[520px] w-full max-w-[280px] sm:max-w-[380px] md:max-w-[420px]">
              <Image
                src={image}
                alt={product.name}
                fill
                unoptimized
                className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] sm:drop-shadow-[0_30px_40px_rgba(0,0,0,0.2)]"
                sizes="(max-width: 640px) 280px, (max-width: 768px) 380px, 420px"
                priority={index === 0}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* NAV BUTTONS - Hidden on Mobile, Visible on Desktop */}
      <button 
        onClick={prev} 
        className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 text-3xl text-gray-700 hover:text-green-700"
        aria-label="Previous product"
      >
        ‹
      </button>
      <button 
        onClick={next} 
        className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 text-3xl text-gray-700 hover:text-green-700"
        aria-label="Next product"
      >
        ›
      </button>

      {/* INDICATOR DOTS - Visible on Mobile & Desktop */}
      <div className="flex absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 items-center gap-2">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full touch-manipulation ${
              i === index
                ? 'w-8 h-2 sm:w-10 sm:h-3 bg-green-700 shadow-md'
                : 'w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>




      {/* PROGRESS BAR - Mobile */}
      {!paused && (
        <motion.div
          key={index}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-0.5 sm:h-1 bg-green-700/70 z-20"
        />
      )}
    </section>
  );
}
