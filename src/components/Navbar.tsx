'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CartIcon from './CartIcon';
import AuthButton from './AuthButton';
import Logo from './Logo';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Auto-close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Check user authentication and admin status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.role === 'admin');
          });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white md:bg-white/95 md:backdrop-blur-md shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="hidden sm:block">
            <Logo href="/" width={180} height={70} className="group" />
          </div>
          <div className="sm:hidden">
            <Logo href="/" width={120} height={48} className="group" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['products', 'about', 'contact'].map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                className="text-gray-700 hover:text-[#2d5016] font-medium relative group transition-colors"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2d5016] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
            <AuthButton />
            <CartIcon />
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <CartIcon />

            <div className="h-6 w-px bg-gray-300 mx-1" />

            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-gray-700 hover:text-[#2d5016] p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
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

        {/* Mobile Menu (Animated) */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 bg-white shadow-inner border-t border-gray-100">
            {/* Navigation Links */}
            {['products', 'about', 'contact'].map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                className="block py-3 px-4 text-base text-gray-700 hover:text-[#2d5016] font-medium hover:bg-gray-50 transition-colors"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Link>
            ))}
            
            {/* Divider */}
            {user && (
              <div className="border-t border-gray-200 my-2"></div>
            )}
            
            {/* User Account Section */}
            {user ? (
              <>
                <Link
                  href="/orders"
                  className="block py-3 px-4 text-base text-gray-700 hover:text-[#2d5016] font-medium hover:bg-gray-50 transition-colors"
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/orders"
                    className="block py-3 px-4 text-base text-[#2d5016] hover:text-[#1f3509] font-semibold hover:bg-green-50 transition-colors"
                  >
                    (Admin) Dashboard
                  </Link>
                )}
                <Link
                  href="/contact"
                  className="block py-3 px-4 text-base text-gray-700 hover:text-[#2d5016] font-medium hover:bg-gray-50 transition-colors"
                >
                  Contact
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 px-4 text-base text-red-600 hover:text-red-700 font-medium hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block py-3 px-4 text-base text-gray-700 hover:text-[#2d5016] font-medium hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
