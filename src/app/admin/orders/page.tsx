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
  user_id: string;
  status: 'created' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  payment_method: 'upi' | 'card' | 'cod' | null;
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: any;
  created_at: string;
  order_items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const checkAdminAndFetchOrders = async () => {
      try {
        // Check for user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/');
          return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          alert('Access denied. Admin only.');
          router.push('/');
          return;
        }

        setIsAdmin(true);

        // Get access token
        const accessToken = session.access_token;

        // Fetch all orders
        const response = await fetch('/api/admin/orders', {
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
        console.error('Error:', error);
        alert('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchOrders();
  }, [router]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/update-order-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      // Refresh orders
      const ordersResponse = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (ordersResponse.ok) {
        const data = await ordersResponse.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#2d5016] mb-2">
              All Orders
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage all customer orders
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/admin/analytics"
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#2d5016] text-[#2d5016] rounded-lg font-heading font-semibold hover:bg-[#2d5016] hover:text-white transition-all text-center text-sm sm:text-base min-h-[44px] flex items-center justify-center"
            >
              Analytics
            </Link>
            <Link
              href="/admin/products"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2d5016] text-white rounded-lg font-heading font-semibold hover:bg-[#1f3509] text-center text-sm sm:text-base min-h-[44px] flex items-center justify-center"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer hover-lift"
              >
                {/* Order Card Header */}
                <div className="p-5 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      #{order.order_number}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="font-heading font-bold text-2xl text-[#2d5016]">
                    ₹{order.amount}
                  </p>
                </div>

                {/* Order Card Body */}
                <div className="p-5">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)} 
                        {order.payment_method && ` (${order.payment_method.toUpperCase()})`}
                      </p>
                    </div>
                    {order.order_items && order.order_items.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Items</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.order_items[0]?.product_name}
                          {order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}
                        </p>
                      </div>
                    )}
                    {order.shipping_address && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Delivery To</p>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {order.shipping_address.name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {order.shipping_address.city}, {order.shipping_address.state}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Status Update */}
                <div className="p-5 border-t border-gray-200 bg-gray-50">
                  <select
                    value={order.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(order.id, e.target.value);
                    }}
                    disabled={updatingOrder === order.id}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#2d5016] focus:border-transparent disabled:opacity-50 bg-white"
                  >
                    <option value="created">Created</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {updatingOrder === order.id && (
                    <div className="mt-2 text-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2d5016] mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="font-heading font-bold text-lg sm:text-2xl text-gray-900 truncate">
                    Order #{selectedOrder.order_number}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Order Status & Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-heading font-bold text-2xl text-[#2d5016]">
                      ₹{selectedOrder.amount}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Payment Status</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.payment_method?.toUpperCase() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity} × ₹{item.product_price}
                            </p>
                          </div>
                          <p className="font-heading font-bold text-lg text-[#2d5016]">
                            ₹{item.product_price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Delivery Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <strong>{selectedOrder.shipping_address.name}</strong><br />
                        {selectedOrder.shipping_address.address}<br />
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}<br />
                        <span className="mt-2 inline-block">Phone: {selectedOrder.shipping_address.phone}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Update Order Status</h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      handleStatusUpdate(selectedOrder.id, e.target.value);
                      setSelectedOrder({ ...selectedOrder, status: e.target.value as any });
                    }}
                    disabled={updatingOrder === selectedOrder.id}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#2d5016] focus:border-transparent disabled:opacity-50"
                  >
                    <option value="created">Created</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {updatingOrder === selectedOrder.id && (
                    <p className="mt-2 text-sm text-gray-500 text-center">Updating...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

