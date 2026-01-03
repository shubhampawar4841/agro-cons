import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Create a refund for an order
 * POST /api/refunds/create
 * 
 * Body: {
 *   orderId: string,
 *   amount?: number, // Optional - if not provided, full refund
 *   reason?: string
 * }
 */
export async function POST(req: Request) {
  try {
    const { orderId, amount, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, amount, razorpay_payment_id, payment_status, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found', details: orderError?.message },
        { status: 404 }
      );
    }

    // Validate order can be refunded
    if (!order.razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Order does not have a Razorpay payment ID' },
        { status: 400 }
      );
    }

    if (order.payment_status === 'refunded') {
      return NextResponse.json(
        { error: 'Order is already fully refunded' },
        { status: 400 }
      );
    }

    // Calculate refund amount
    const refundAmount = amount || order.amount;
    const refundAmountInPaise = Math.round(refundAmount * 100); // Razorpay uses paise

    // Check if partial refund is valid
    if (amount && amount > order.amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed order amount' },
        { status: 400 }
      );
    }

    // Check existing refunds
    const { data: existingRefunds } = await supabaseAdmin
      .from('refunds')
      .select('amount')
      .eq('order_id', orderId)
      .eq('status', 'processed');

    const totalRefunded = existingRefunds?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
    const remainingAmount = order.amount - totalRefunded;

    if (refundAmount > remainingAmount) {
      return NextResponse.json(
        { 
          error: 'Refund amount exceeds remaining refundable amount',
          details: `Remaining: ₹${remainingAmount}, Requested: ₹${refundAmount}`
        },
        { status: 400 }
      );
    }

    // Create refund record in DB first (status: initiated)
    const { data: refund, error: refundError } = await supabaseAdmin
      .from('refunds')
      .insert({
        order_id: orderId,
        amount: refundAmount,
        status: 'initiated',
        reason: reason || 'Customer request',
      })
      .select()
      .single();

    if (refundError) {
      return NextResponse.json(
        { error: 'Failed to create refund record', details: refundError.message },
        { status: 500 }
      );
    }

    try {
      // Initiate refund with Razorpay
      const razorpayRefund = await razorpay.payments.refund(order.razorpay_payment_id, {
        amount: refundAmountInPaise,
        notes: {
          reason: reason || 'Customer request',
          order_id: orderId,
        },
      });

      // Update refund record with Razorpay refund ID and status
      const { error: updateError } = await supabaseAdmin
        .from('refunds')
        .update({
          razorpay_refund_id: razorpayRefund.id,
          status: 'processed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', refund.id);

      if (updateError) {
        console.error('Failed to update refund record:', updateError);
        // Note: Refund is processed in Razorpay but DB update failed
        // This should be handled by webhook or manual reconciliation
      }

      return NextResponse.json({
        success: true,
        refund: {
          id: refund.id,
          razorpay_refund_id: razorpayRefund.id,
          amount: refundAmount,
          status: 'processed',
        },
        message: refundAmount === order.amount 
          ? 'Full refund processed successfully' 
          : 'Partial refund processed successfully',
      });
    } catch (razorpayError: any) {
      // Update refund status to failed
      await supabaseAdmin
        .from('refunds')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', refund.id);

      return NextResponse.json(
        { 
          error: 'Razorpay refund failed', 
          details: razorpayError?.error?.description || razorpayError.message 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Refund creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


