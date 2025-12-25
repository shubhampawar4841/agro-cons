'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    // Get order number from URL params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const order = params.get('order');
      if (order) {
        setOrderNumber(order);
      } else {
        // Fallback to generated order number
        setOrderNumber(`ORD-${Date.now().toString().slice(-8)}`);
      }
    }

    // Clear cart after successful order
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#2d5016]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#2d5016] mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-heading font-semibold text-gray-900">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-heading font-semibold text-gray-900">
                  3-5 Business Days
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="px-8 py-3 bg-[#2d5016] text-white rounded-lg font-heading font-semibold hover:bg-[#1f3509] shadow-lg hover:shadow-xl transition-all"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 border-2 border-[#2d5016] text-[#2d5016] rounded-lg font-heading font-semibold hover:bg-[#2d5016] hover:text-white transition-all"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              You will receive an order confirmation email shortly. 
              For any queries, please contact us at support@agricorns.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

