'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TrustBadge from '@/components/TrustBadge';
import ProductCard from '@/components/ProductCard';
import ProductSlideshow from '@/components/ProductSlideshow';
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

interface SlideshowProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  weight: string;
  image_url: string;
  images?: string[];
  description?: string | null;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [slideshowProducts, setSlideshowProducts] = useState<SlideshowProduct[]>([]);

  // Hardcoded slideshow products as provided by user
  const defaultSlideshowProducts: SlideshowProduct[] = [
    {
      id: "9d5a8afc-df07-4fb5-bb5f-d44f3adb5054",
      name: "Moringa Powder",
      slug: "moringa-powder",
      description: null,
      price: "249.00",
      weight: "200g",
      image_url: "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767339915169-36qbume3iwy.jpeg",
      images: [
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767339915169-36qbume3iwy.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767342599380-bizv9tp8yd4.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767342601204-iuhxisdaki.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767342603259-pewn0ta9ohp.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767342605530-pctdlejq8w.jpeg"
      ]
    },
    {
      id: "897bfead-1b1d-4864-9002-329510f8682f",
      name: "Organic Ashwagandha Powder",
      slug: "organic-ashwagandha-powder",
      description: null,
      price: "599.00",
      weight: "200g",
      image_url: "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767338680252-elkvo5d0hs.jpeg",
      images: [
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767338680252-elkvo5d0hs.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431182674-i4fr2if0x5.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431186444-v8rtvoxhqd7.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431188991-twj6b16hns8.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431191156-z1652ul7ibm.jpeg"
      ]
    },
    {
      id: "4ba2a2f3-8cb7-4d57-88da-6a303dac0eb6",
      name: "Organic Toor Dal",
      slug: "organic-toor-dal",
      description: "Traditional organic toor dal, staple of Indian cuisine. Rich in protein and essential nutrients.",
      price: "129.00",
      weight: "500g",
      image_url: "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1766653426070-t0a6krql7ur.jpg",
      images: [
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1766653426070-t0a6krql7ur.jpg"
      ]
    },
    {
      id: "2c8fa3f5-6605-4de2-aa44-dfd5dc4cbf50",
      name: "Organic Beetroot Powder",
      slug: "organic-beetroot-powder",
      description: "Premium organic beetroot powder, rich in nutrients and antioxidants.",
      price: "149.00",
      weight: "100g",
      image_url: "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431085085-gs6h61m3ptv.jpeg",
      images: [
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431085085-gs6h61m3ptv.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431087768-o83hbl4qwz9.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431089566-mwopd1wso4q.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431091987-ih59rvbrqeg.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431094119-vsyhyyctoip.jpeg",
        "https://ewvcnnnwtuamerqsdxte.supabase.co/storage/v1/object/public/product-image/products/1767431096506-j6ds4u0hrjh.jpeg"
      ]
    }
  ];

  useEffect(() => {
    setSlideshowProducts(defaultSlideshowProducts);
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

      {/* Hero Section with Product Slideshow - Full Width */}
      <section className="relative w-full overflow-hidden">
        {/* Product Slideshow - Full Width */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full"
        >
          {slideshowProducts.length > 0 && (
            <ProductSlideshow products={slideshowProducts} autoPlayInterval={5000} />
          )}
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
