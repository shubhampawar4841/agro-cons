'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 2000); // Max 2 seconds loading

    // Check current session (fast, non-blocking)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      clearTimeout(timeout);
      setUser(session?.user ?? null);
      setLoading(false); // Show UI immediately
      
      // Check admin status in background (non-blocking)
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    }).catch(() => {
      if (!mounted) return;
      clearTimeout(timeout);
      setLoading(false); // Show UI even on error
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      
      router.refresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      // Silently fail - not critical for UI
      setIsAdmin(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  if (loading) {
    return (
      <button className="px-4 py-2 text-gray-700 hover:text-[#2d5016] font-medium">
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/orders"
          className="text-sm text-gray-700 hover:text-[#2d5016] font-medium"
        >
          My Orders
        </Link>
        {isAdmin && (
          <Link
            href="/admin/orders"
            className="text-sm text-[#2d5016] hover:text-[#1f3509] font-semibold"
          >
            Admin
          </Link>
        )}
        <span className="text-sm text-gray-700">
          {user.email?.split('@')[0]}
        </span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-gray-700 hover:text-[#2d5016] font-medium"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center space-x-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
}

