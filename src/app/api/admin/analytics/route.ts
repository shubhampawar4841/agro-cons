import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// GET - Fetch analytics data (admin only)
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No access token provided' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid user session' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get last 6 months of sales data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Fetch orders from last 6 months
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (ordersError) {
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      );
    }

    // Calculate monthly sales
    const monthlySales: { [key: string]: number } = {};
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

    orders?.forEach((order) => {
      if (order.payment_status === 'paid' || order.status === 'delivered') {
        // Monthly sales
        const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthlySales[month] = (monthlySales[month] || 0) + Number(order.amount);

        // Product sales
        if (order.order_items) {
          order.order_items.forEach((item: any) => {
            const productName = item.product_name;
            if (!productSales[productName]) {
              productSales[productName] = {
                name: productName,
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[productName].quantity += item.quantity;
            productSales[productName].revenue += Number(item.product_price) * item.quantity;
          });
        }
      }
    });

    // Format monthly sales for chart
    const salesChartData = Object.entries(monthlySales)
      .map(([month, sales]) => ({
        month: month.split(' ')[0], // Just month name
        sales: Math.round(sales),
      }))
      .sort((a, b) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    // Get top 5-7 selling products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7)
      .map((product) => ({
        name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
        quantity: product.quantity,
        revenue: Math.round(product.revenue),
      }));

    // Fetch refunds from last 6 months (if refunds table exists)
    let refunds: any[] = [];
    try {
      const { data: refundsData, error: refundsError } = await supabase
        .from('refunds')
        .select('*, orders(amount)')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (refundsError) {
        // Refunds table might not exist yet - use empty array
        console.log('Refunds table not available:', refundsError.message);
        refunds = [];
      } else {
        refunds = refundsData || [];
      }
    } catch (error) {
      // Refunds table doesn't exist - use empty array
      console.log('Refunds table not available');
      refunds = [];
    }

    // Calculate refund statistics
    const monthlyRefunds: { [key: string]: number } = {};
    const refundStatusCount: { [key: string]: number } = {
      initiated: 0,
      processed: 0,
      failed: 0,
    };

    let totalRefundAmount = 0;
    let totalRefunds = 0;

    refunds.forEach((refund) => {
      const month = new Date(refund.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthlyRefunds[month] = (monthlyRefunds[month] || 0) + Number(refund.amount);
      
      refundStatusCount[refund.status] = (refundStatusCount[refund.status] || 0) + 1;
      
      if (refund.status === 'processed') {
        totalRefundAmount += Number(refund.amount);
      }
      totalRefunds += 1;
    });

    // Format monthly refunds for chart
    const refundsChartData = Object.entries(monthlyRefunds)
      .map(([month, amount]) => ({
        month: month.split(' ')[0], // Just month name
        refunds: Math.round(amount),
      }))
      .sort((a, b) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    // Format refund status for chart
    const refundStatusData = Object.entries(refundStatusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));

    // Calculate total stats
    const totalRevenue = orders
      ?.filter((o) => o.payment_status === 'paid' || o.status === 'delivered' || o.payment_status === 'captured')
      .reduce((sum, o) => sum + Number(o.amount), 0) || 0;

    const totalOrders = orders?.length || 0;
    const pendingOrders = orders?.filter((o) => o.status === 'created' || o.status === 'paid').length || 0;

    return NextResponse.json({
      success: true,
      analytics: {
        salesChart: salesChartData,
        topProducts,
        refundsChart: refundsChartData,
        refundStatusChart: refundStatusData,
        stats: {
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          pendingOrders,
          totalRefunds,
          totalRefundAmount: Math.round(totalRefundAmount),
          refundRate: totalOrders > 0 ? ((totalRefunds / totalOrders) * 100).toFixed(2) : '0.00',
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}








