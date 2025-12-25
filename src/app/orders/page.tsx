'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'created' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  payment_method: 'upi' | 'card' | 'cod' | null;
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: any;
  created_at: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Check for user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/');
          return;
        }

        setUser(session.user);

        // Get access token
        const accessToken = session.access_token;

        // Fetch orders
        const response = await fetch('/api/get-orders', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#2d5016] mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            View all your past and current orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-8">Start shopping to see your orders here!</p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-[#2d5016] text-white rounded-lg font-heading font-semibold hover:bg-[#1f3509]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading font-semibold text-lg text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-xl text-[#2d5016] mb-1">
                        ₹{order.amount}
                      </p>
                      <p className={`text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </p>
                      {order.payment_method && (
                        <p className="text-xs text-gray-500 mt-1">
                          {order.payment_method.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity} × ₹{item.product_price}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₹{item.product_price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                    <p className="text-sm text-gray-700">
                      {order.shipping_address.name}<br />
                      {order.shipping_address.address}<br />
                      {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}<br />
                      Phone: {order.shipping_address.phone}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


