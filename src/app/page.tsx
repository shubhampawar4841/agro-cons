'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TrustBadge from '@/components/TrustBadge';
import ProductCard from '@/components/ProductCard';
import BannerSlideshow from '@/components/BannerSlideshow';
import GeneralAIAssistant from '@/components/GeneralAIAssistant';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  weight: string;
  image_url: string;
  rating?: number;
  images?: string[];
  description?: string | null;
}

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  weight: string;
  image_url: string;
  rating?: number;
  images?: string[];
  description?: string | null;
}


export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

  // Banner images from public/banner folder
  const bannerImages = [
    '/banner/Moringa-Products-New-Launch_b88676fe-a193-41fd-8d50-121fcc4acf75.webp',
    '/banner/Seabuckthorn-Pulp-New-Launch.webp',
    '/banner/Web-Banner.webp',
    '/banner/WhatsApp_Image_2025-05-23_at_6.08.24_PM.webp'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const productsWithRating = (data.products || []).slice(0, 4).map((p: any) => ({
          ...p,
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
          rating: 4.5,
        }));
        setFeaturedProducts(productsWithRating);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Banner Slideshow - Full Width */}
{/* Banner Slideshow - Full Width */}
<section className="relative w-full overflow-hidden -mt-[64px] sm:mt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full"
        >
          <BannerSlideshow images={bannerImages} autoPlayInterval={5000} />
        </motion.div>
      </section>

      {/* Trust Icons Section with scroll animation */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-12 sm:py-16 bg-white border-y border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            {[
              { icon: "🌿", label: "100% Organic" },
              { icon: "🇮🇳", label: "Made in India" },
              { icon: "🚚", label: "Fast Delivery" },
              { icon: "✨", label: "Premium Quality" }
            ].map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TrustBadge icon={badge.icon} label={badge.label} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Products Section with scroll animation */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2d5016]/10 rounded-full border border-[#2d5016]/20"
            >
              <span className="text-xs sm:text-sm font-semibold text-[#2d5016]">Our Best Sellers</span>
            </motion.div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d5016] mb-3 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Handpicked organic products for your health and wellness journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-10 sm:mt-16"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/products"
                className="inline-flex items-center px-6 sm:px-10 py-3 sm:py-4 border-2 border-[#2d5016] text-[#2d5016] rounded-xl font-heading font-semibold text-base sm:text-lg hover:bg-[#2d5016] hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl min-h-[48px]"
              >
                View All Products
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#2d5016] to-[#1f3509] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4">
                {/* <Logo width={140} height={70} className="brightness-0 invert" /> */}
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Your trusted source for organic agro products. 
                We bring you the finest quality products directly from Indian farms.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="text-lg">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="text-lg">📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="text-lg">🐦</span>
                </a>
                <a 
                  href="https://wa.me/919876543210?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20your%20products." 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#25D366]/20 hover:bg-[#25D366]/30 rounded-full flex items-center justify-center transition-colors group"
                  aria-label="Chat on WhatsApp"
                >
                  <svg
                    className="w-6 h-6 text-[#25D366] group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link href="/products" className="hover:text-white transition-colors flex items-center group">
                    <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span>
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors flex items-center group">
                    <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors flex items-center group">
                    <span className="mr-2 group-hover:translate-x-1 transition-transform">→</span>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="mr-3">📍</span>
                  <div>
                    <p className="font-medium text-white mb-1">Agricorns Food's</p>
                    <p className="text-sm leading-relaxed">
                      Plot no A-25, Jakekur MIDC, Omerga,<br />
                      Dist-Dharashiv, Maharashtra 413606
                    </p>
                  </div>
                </li>
                <li className="flex items-start mt-4">
                  <span className="mr-3">📧</span>
                  <a href="mailto:info@agricorns.in" className="hover:text-white transition-colors">
                    info@agricorns.in
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400">
              &copy; 2024 AGRICORNS. All rights reserved. | Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>

      {/* General AI Assistant */}
      <GeneralAIAssistant />
    </div>
  );
}
