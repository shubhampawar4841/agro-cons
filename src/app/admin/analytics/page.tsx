'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AnalyticsData {
  salesChart: { month: string; sales: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  refundsChart: { month: string; refunds: number }[];
  refundStatusChart: { status: string; count: number }[];
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalRefunds: number;
    totalRefundAmount: number;
    refundRate: string;
  };
}

const REFUND_STATUS_COLORS = {
  'Initiated': '#fbbf24', // Yellow
  'Processed': '#ef4444', // Red
  'Failed': '#6b7280',   // Gray
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchAnalytics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/');
          return;
        }

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
        await fetchAnalytics(session.access_token);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchAnalytics();
  }, [router]);

  const fetchAnalytics = async (accessToken: string) => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin || !analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#2d5016] mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Sales insights and product performance
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/admin/orders"
              className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#2d5016] text-[#2d5016] rounded-lg font-heading font-semibold hover:bg-[#2d5016] hover:text-white transition-all text-center text-sm sm:text-base min-h-[44px] flex items-center justify-center"
            >
              View Orders
            </Link>
            <Link
              href="/admin/products"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2d5016] text-white rounded-lg font-heading font-semibold hover:bg-[#1f3509] transition-all text-center text-sm sm:text-base min-h-[44px] flex items-center justify-center"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#2d5016]">
                  ₹{analytics.stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#2d5016]">
                  {analytics.stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#2d5016]">
                  {analytics.stats.pendingOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Refunds</p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#2d5016]">
                  {analytics.stats.totalRefunds}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">↩️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Refund Amount</p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-red-600">
                  ₹{analytics.stats.totalRefundAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Refund Rate</p>
                <p className="font-heading font-bold text-2xl sm:text-3xl text-[#2d5016]">
                  {analytics.stats.refundRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-4">
              Sales Trend (Last 6 Months)
            </h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={analytics.salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Sales']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#2d5016" 
                  strokeWidth={3}
                  dot={{ fill: '#2d5016', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Refunds Chart */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-4">
              Refunds Trend (Last 6 Months)
            </h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={analytics.refundsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Refunds']}
                />
                <Line 
                  type="monotone" 
                  dataKey="refunds" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-4">
              Top Selling Products
            </h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart 
                data={analytics.topProducts}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [value, 'Quantity Sold']}
                />
                <Bar 
                  dataKey="quantity" 
                  fill="#2d5016"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Refund Status Chart */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-4">
              Refund Status Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <PieChart>
  <Pie
    data={analytics.refundStatusChart}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={({ payload, percent }) => {
      const safePercent = percent ?? 0;
      return `${payload.status}: ${payload.count} (${(safePercent * 100).toFixed(0)}%)`;
    }}
    outerRadius={80}
    dataKey="count"
  >
    {analytics.refundStatusChart.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={
          REFUND_STATUS_COLORS[
            entry.status as keyof typeof REFUND_STATUS_COLORS
          ] || '#8884d8'
        }
      />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>


            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-gray-900 mb-4">
            Product Performance Details
          </h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 break-words">{product.name}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.quantity} units</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#2d5016]">
                        ₹{product.revenue.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

