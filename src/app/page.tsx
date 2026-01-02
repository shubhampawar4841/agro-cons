'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TrustBadge from '@/components/TrustBadge';
import ProductCard from '@/components/ProductCard';
import GeneralAIAssistant from '@/components/GeneralAIAssistant';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  weight: string;
  image_url: string;
  rating?: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const productsWithRating = (data.products || []).slice(0, 4).map((p: Product) => ({
          ...p,
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2d5016]/5 via-[#f4d03f]/10 to-[#2d5016]/5 py-16 md:py-24 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2d5016]/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#f4d03f]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Hero content with staggered animations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-block mb-4 px-4 py-2 bg-[#2d5016]/10 rounded-full border border-[#2d5016]/20"
              >
                <span className="text-sm font-semibold text-[#2d5016]">🌱 100% Organic</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2d5016] mb-4 sm:mb-6 leading-tight"
              >
                Pure, Organic Agro Products from{' '}
                <span className="text-[#4a7c2a]">AGRICORNS</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed"
              >
                Discover premium quality organic products sourced directly from Indian farms. 
                Every product is carefully selected for purity and quality assurance.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#2d5016] to-[#4a7c2a] text-white rounded-xl font-heading font-semibold text-base sm:text-lg hover:from-[#1f3509] hover:to-[#2d5016] shadow-xl hover:shadow-2xl transition-all duration-200 min-h-[48px]"
                  >
                    Shop Now
                    <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-[#2d5016] text-[#2d5016] rounded-xl font-heading font-semibold text-base sm:text-lg hover:bg-[#2d5016] hover:text-white shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px]"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            {/* Hero image with fade and scale animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#2d5016]/20 to-transparent z-10"></div>
              <Image
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=600&fit=crop"
                alt="Organic agro products"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
            </motion.div>
          </div>
        </div>
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="/WhatsApp Image 2025-12-24 at 10.57.56 PM.jpeg"
                    alt="AGRICORNS Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-heading font-bold text-2xl">AGRICORNS</h3>
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
