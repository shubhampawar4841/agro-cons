'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  weight: string;
  image_url: string;
  rating?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // Add default rating for compatibility
        const productsWithRating = (data.products || []).map((p: Product) => ({
          ...p,
          rating: 4.5, // Default rating
        }));
        setProducts(productsWithRating);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Header skeleton */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-gray-200 rounded-full animate-shimmer h-8 w-48 mx-auto"></div>
            <div className="h-12 bg-gray-200 rounded animate-shimmer w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded animate-shimmer w-96 mx-auto"></div>
          </div>
          {/* Product grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header Section with fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block mb-4 px-4 py-2 bg-[#2d5016]/10 rounded-full border border-[#2d5016]/20"
          >
            <span className="text-sm font-semibold text-[#2d5016]">Our Complete Collection</span>
          </motion.div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#2d5016] mb-4">
            All Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our complete collection of organic agro products, carefully selected for quality and purity
          </p>
        </motion.div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

