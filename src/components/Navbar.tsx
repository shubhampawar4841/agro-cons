'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import CartIcon from './CartIcon';
import AuthButton from './AuthButton';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/WhatsApp Image 2025-12-24 at 10.57.56 PM.jpeg"
                alt="AGRICORNS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-heading font-bold text-2xl text-[#2d5016] group-hover:text-[#4a7c2a] transition-colors">
              AGRICORNS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-[#2d5016] font-medium relative group transition-colors"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-[#2d5016] font-medium relative group transition-colors"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-[#2d5016] font-medium relative group transition-colors"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <AuthButton />
            <CartIcon />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2 sm:space-x-4">
            <AuthButton />
            <CartIcon />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#2d5016] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <Link
              href="/products"
              className="block py-2 text-gray-700 hover:text-[#2d5016] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="block py-2 text-gray-700 hover:text-[#2d5016] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-gray-700 hover:text-[#2d5016] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

