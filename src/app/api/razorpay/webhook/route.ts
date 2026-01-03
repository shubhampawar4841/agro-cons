import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

/**
 * Razorpay Webhook Handler
 * POST /api/razorpay/webhook
 * 
 * Handles:
 * - payment.captured
 * - payment.failed
 * - refund.created
 * - refund.processed
 * - order.paid
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event, supabaseAdmin);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event, supabaseAdmin);
        break;

      case 'refund.created':
      case 'refund.processed':
        await handleRefundProcessed(event, supabaseAdmin);
        break;

      case 'order.paid':
        await handleOrderPaid(event, supabaseAdmin);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(event: any, supabase: any) {
  const payment = event.payload.payment.entity;
  
  // IDEMPOTENCY: Find order by razorpay_payment_id or razorpay_order_id
  // Webhook is FINAL AUTHORITY - updates order status
  let { data: order } = await supabase
    .from('orders')
    .select('id, payment_status, razorpay_payment_id')
    .eq('razorpay_payment_id', payment.id)
    .single();

  if (!order) {
    // Try to find by razorpay_order_id (handler may not have set payment_id yet)
    const razorpayOrderId = payment.order_id;
    if (razorpayOrderId) {
      const { data: orderByOrderId } = await supabase
        .from('orders')
        .select('id, payment_status, razorpay_payment_id')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();
      
      if (orderByOrderId) {
        order = orderByOrderId;
        // Update with payment_id if missing (link payment to order)
        if (!order.razorpay_payment_id) {
          await supabase
            .from('orders')
            .update({ razorpay_payment_id: payment.id })
            .eq('id', order.id);
        }
      }
    }
  }

  if (order) {
    // WEBHOOK IS FINAL AUTHORITY - Always update payment_status
    // Even if handler already set it, webhook confirms it (FINAL TRUTH)
    await supabase
      .from('orders')
      .update({
        payment_status: 'captured', // Webhook confirms capture (FINAL TRUTH)
        razorpay_signature: event.payload.payment.entity.notes?.signature || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);
    
    console.log('✅ Payment captured - order updated via webhook (final authority)', {
      order_id: order.id,
      payment_id: payment.id,
      previous_status: order.payment_status,
    });
  } else {
    // Order doesn't exist yet - handler hasn't created it
    // This is OK - handler will create it, then next webhook will update it
    // OR: Handler may have failed, but we can't create order without user/shipping data
    console.warn('⚠️ Order not found in DB - webhook arrived before handler:', {
      payment_id: payment.id,
      razorpay_order_id: payment.order_id,
      amount: payment.amount,
      note: 'Handler will create order, or order creation may have failed. Next webhook will update status.',
    });
    // Note: In production, you might want to:
    // 1. Store this in a "pending_payments" table for reconciliation
    // 2. Set up a cron job to reconcile pending payments
    // 3. Or just rely on handler creating order (current approach)
  }
}

async function handlePaymentFailed(event: any, supabase: any) {
  const payment = event.payload.payment.entity;
  
  // WEBHOOK IS FINAL AUTHORITY - Override handler's optimistic status
  const { data: order } = await supabase
    .from('orders')
    .select('id, payment_status')
    .eq('razorpay_payment_id', payment.id)
    .single();

  if (order) {
    // Webhook confirms failure - override any optimistic status
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed', // Webhook confirms failure (FINAL TRUTH)
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);
    
    console.log('✅ Payment failed - order updated via webhook (final authority)');
  } else {
    console.warn('⚠️ Payment failed but order not found:', payment.id);
  }
}

async function handleRefundProcessed(event: any, supabase: any) {
  const refund = event.payload.refund.entity;
  
  // Find refund by razorpay_refund_id
  const { data: existingRefund } = await supabase
    .from('refunds')
    .select('id, order_id')
    .eq('razorpay_refund_id', refund.id)
    .single();

  if (existingRefund) {
    await supabase
      .from('refunds')
      .update({
        status: 'processed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRefund.id);
  } else {
    // Refund created externally - create record
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_payment_id', refund.payment_id)
      .single();

    if (order) {
      await supabase
        .from('refunds')
        .insert({
          order_id: order.id,
          razorpay_refund_id: refund.id,
          amount: refund.amount / 100, // Convert from paise to rupees
          status: 'processed',
          reason: refund.notes?.reason || 'External refund',
        });
    }
  }
}

async function handleOrderPaid(event: any, supabase: any) {
  const order = event.payload.order.entity;
  
  const { data: dbOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_order_id', order.id)
    .single();

  if (dbOrder) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'captured',
        updated_at: new Date().toISOString(),
      })
      .eq('id', dbOrder.id);
  }
}


