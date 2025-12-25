'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartIcon() {
  const [itemCount, setItemCount] = useState(0);
  const [shouldBounce, setShouldBounce] = useState(false);

  useEffect(() => {
    // Get cart count from localStorage
    const cart = localStorage.getItem('cart');
    if (cart) {
      const cartItems = JSON.parse(cart);
      const count = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setItemCount(count);
    }

    // Listen for cart updates with bounce animation
    const handleStorageChange = () => {
      const cart = localStorage.getItem('cart');
      let newCount = 0;
      
      if (cart) {
        const cartItems = JSON.parse(cart);
        newCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      }
      
      // Trigger bounce if count increased
      setItemCount((prevCount) => {
        if (newCount > prevCount) {
          setShouldBounce(true);
          setTimeout(() => setShouldBounce(false), 500);
        }
        return newCount;
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative p-2.5 text-gray-700 hover:text-[#2d5016] transition-colors duration-200 group"
      aria-label="Shopping cart"
    >
      <motion.div 
        className="relative"
        animate={shouldBounce ? {
          scale: [1, 1.2, 1.1, 1],
          rotate: [0, -5, 5, -2, 0]
        } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </motion.svg>
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 bg-gradient-to-r from-[#2d5016] to-[#4a7c2a] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
            >
              {itemCount > 9 ? '9+' : itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

