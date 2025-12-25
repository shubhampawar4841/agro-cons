'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CartIcon() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Get cart count from localStorage
    const cart = localStorage.getItem('cart');
    if (cart) {
      const cartItems = JSON.parse(cart);
      const count = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setItemCount(count);
    }

    // Listen for cart updates
    const handleStorageChange = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const cartItems = JSON.parse(cart);
        const count = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setItemCount(count);
      } else {
        setItemCount(0);
      }
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
      className="relative p-2.5 text-gray-700 hover:text-[#2d5016] transition-all duration-300 group"
      aria-label="Shopping cart"
    >
      <div className="relative">
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#2d5016] to-[#4a7c2a] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </div>
    </Link>
  );
}

