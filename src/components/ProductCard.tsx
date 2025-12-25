'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ImageCarousel from './ImageCarousel';

interface Product {
  id: string;
  name: string;
  price: number;
  weight: string;
  image?: string;
  image_url?: string;
  images?: string[];
  rating?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // Get images array or fallback to single image_url
  const getImages = () => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    const singleImage = product.image || product.image_url;
    return singleImage ? [singleImage] : [];
  };

  const images = getImages();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const cart = localStorage.getItem('cart');
    const cartItems = cart ? JSON.parse(cart) : [];
    
    const existingItem = cartItems.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Dispatch custom event for cart icon update with bounce animation
    window.dispatchEvent(new Event('cartUpdated'));

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-[#f4d03f]' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link href={`/products/${(product as any).slug || product.id}`}>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover-lift group cursor-pointer h-full flex flex-col">
          {/* Image container with scale animation */}
          <div className="relative w-full h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <div className="product-image-hover h-full">
              <ImageCarousel images={images} alt={product.name} className="h-full" />
            </div>
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-heading font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2d5016] transition-colors duration-200 min-h-[3rem]">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 mb-3 font-medium">{product.weight}</p>
            {product.rating && (
              <div className="flex items-center space-x-1 mb-4 text-sm">
                {renderStars(product.rating)}
                <span className="text-gray-500 ml-1 text-xs">({product.rating})</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
              <div>
                <span className="text-xs text-gray-500 line-through opacity-60">₹{Math.round(product.price * 1.1)}</span>
                <span className="font-heading font-bold text-xl text-[#2d5016] ml-2">
                  ₹{product.price}
                </span>
              </div>
              <motion.button
                onClick={handleAddToCart}
                disabled={isAdding}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#2d5016] to-[#4a7c2a] text-white rounded-lg text-sm font-semibold hover:from-[#1f3509] hover:to-[#2d5016] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden"
              >
                {/* Ripple effect on click */}
                {isAdding ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add to Cart'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

