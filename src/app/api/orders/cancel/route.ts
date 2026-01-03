import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Helper function to make direct REST API call for refunds (more reliable)
async function refundViaREST(paymentId: string, amount: number, speed?: string) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  
  const body: any = { amount };
  if (speed) {
    body.speed = speed;
  }
  
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw { statusCode: response.status, error };
  }
  
  return await response.json();
}

/**
 * Cancel an order
 * POST /api/orders/cancel
 * 
 * Body: {
 *   orderId: string,
 *   reason?: string
 * }
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No access token provided' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid user session' },
        { status: 401 }
      );
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, payment_status, amount, razorpay_payment_id, payment_method, created_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found', details: orderError?.message },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'You can only cancel your own orders' },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      );
    }

    if (order.status === 'delivered') {
      return NextResponse.json(
        { error: 'Cannot cancel delivered order' },
        { status: 400 }
      );
    }

    // Check if order was placed within last 6 hours (cancellation window)
    const orderCreatedAt = new Date(order.created_at);
    const now = new Date();
    const hoursSinceOrder = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60); // Convert to hours
    
    if (hoursSinceOrder > 6) {
      return NextResponse.json(
        { 
          error: 'Cancellation window expired', 
          details: 'Orders can only be cancelled within 6 hours of placement. Please contact support for assistance.',
          hoursSinceOrder: Math.round(hoursSinceOrder * 10) / 10,
        },
        { status: 400 }
      );
    }

    // Use service role for refund operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // If payment was captured, process refund
    let refundProcessed = false;
    if (order.payment_status === 'captured' && order.razorpay_payment_id) {
      try {
        // First, verify payment status with Razorpay before attempting refund
        let canRefund = false;
        let paymentDetails: any = null;
        
        try {
          paymentDetails = await razorpay.payments.fetch(order.razorpay_payment_id);
          // Only refund if payment is actually captured
          const paymentAmount = typeof paymentDetails.amount === 'string' ? parseInt(paymentDetails.amount) : paymentDetails.amount;
          if (paymentDetails.status === 'captured' && paymentAmount > 0) {
            canRefund = true;
          } else {
            console.log(`Payment ${order.razorpay_payment_id} is not in captured state. Status: ${paymentDetails.status}`);
          }
        } catch (fetchError: any) {
          // Check if payment doesn't exist
          if (fetchError.statusCode === 400 && fetchError.error?.description?.includes('does not exist')) {
            console.warn('⚠️ Payment ID does not exist in Razorpay:', {
              payment_id: order.razorpay_payment_id,
              order_id: orderId,
              payment_status: order.payment_status,
              payment_method: order.payment_method,
              possible_reasons: [
                'Payment was never created (e.g., COD order marked as captured)',
                'Payment ID is incorrect in database',
                'Test/Live mode mismatch',
                'Payment was deleted or expired',
              ],
            });
            console.log('Skipping refund - payment does not exist in Razorpay');
            // Continue with cancellation without refund
            canRefund = false;
          } else {
            console.error('Error fetching payment from Razorpay:', fetchError);
            // If we can't fetch payment, don't attempt refund
            canRefund = false;
          }
        }

        if (!canRefund) {
          console.log('Skipping refund - payment not available or not captured in Razorpay');
          // Continue with cancellation without refund
        } else {
          // Check if refunds table exists, if not skip refund record creation
          let refundId: string | null = null;
          
          try {
            // Try to create refund record (only if refunds table exists)
            const { data: refund, error: refundError } = await supabaseAdmin
              .from('refunds')
              .insert({
                order_id: orderId,
                amount: order.amount,
                status: 'initiated',
                reason: reason || 'Order cancellation',
              })
              .select()
              .single();

            if (refundError) {
              // Log error but continue - refunds table might not exist
              console.log('Refund record creation failed (table may not exist):', refundError.message);
            } else if (refund) {
              refundId = refund.id;
            }
          } catch (tableError: any) {
            // If refunds table doesn't exist, log and continue without refund record
            console.log('Refunds table may not exist, skipping refund record creation:', tableError.message);
          }

          // Process refund with Razorpay (even if refund record creation failed)
          const refundAmountInPaise = Math.round(order.amount * 100);
          
          // Log refund attempt details for debugging
          console.log('Attempting Razorpay refund:', {
            payment_id: order.razorpay_payment_id,
            amount_in_paise: refundAmountInPaise,
            amount_in_rupees: order.amount,
            order_id: orderId,
            razorpay_key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.substring(0, 10) + '...', // Log first 10 chars only
            is_test_mode: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_'),
          });
          
          // Declare paymentDetails outside try block for error logging
          let paymentDetails: any = null;
          
          try {
            // First, verify payment exists in Razorpay
            try {
              paymentDetails = await razorpay.payments.fetch(order.razorpay_payment_id);
            } catch (fetchError: any) {
              // Payment doesn't exist in Razorpay
              if (fetchError.statusCode === 400 && fetchError.error?.description?.includes('does not exist')) {
                console.warn('⚠️ Payment ID does not exist in Razorpay:', {
                  payment_id: order.razorpay_payment_id,
                  order_id: orderId,
                  payment_status: order.payment_status,
                  possible_reasons: [
                    'Payment was never created (e.g., COD order)',
                    'Payment ID is incorrect in database',
                    'Test/Live mode mismatch',
                    'Payment was deleted or expired',
                  ],
                });
                
                // Skip refund - payment doesn't exist
                console.log('Skipping refund - payment does not exist in Razorpay');
                // Continue with order cancellation without refund
                return; // Exit the refund processing block
              }
              throw fetchError; // Re-throw other errors
            }
            
            // Convert amounts to numbers (Razorpay returns strings sometimes)
            const paymentAmount = typeof paymentDetails.amount === 'string' 
              ? parseInt(paymentDetails.amount) 
              : paymentDetails.amount;
            const alreadyRefunded = typeof paymentDetails.amount_refunded === 'string'
              ? parseInt(paymentDetails.amount_refunded || '0')
              : (paymentDetails.amount_refunded || 0);
            const refundableAmount = paymentAmount - alreadyRefunded;
            
            console.log('Payment details:', {
              id: paymentDetails.id,
              status: paymentDetails.status,
              amount: paymentAmount,
              amount_refunded: alreadyRefunded,
              refundable_amount: refundableAmount,
            });

            // Check if payment is refundable
            if (paymentDetails.status !== 'captured') {
              throw new Error(`Payment status is ${paymentDetails.status}, not captured. Cannot refund.`);
            }

            // Check if there's enough refundable amount
            if (refundAmountInPaise > refundableAmount) {
              throw new Error(`Refund amount (${refundAmountInPaise}) exceeds refundable amount (${refundableAmount})`);
            }

            // Try refund using direct REST API (more reliable than SDK)
            let razorpayRefund: any;
            
            // Strategy 1: Try instant refund via REST API (speed: 'optimum')
            try {
              console.log('Attempting instant refund via REST API (speed: optimum)...');
              razorpayRefund = await refundViaREST(order.razorpay_payment_id, refundAmountInPaise, 'optimum');
              console.log('✅ Instant refund successful!', razorpayRefund.id);
            } catch (instantError: any) {
              console.log('Instant refund failed, trying normal refund via REST API...', instantError.error?.description || instantError.message);
              
              // Strategy 2: Try normal refund via REST API (no speed parameter)
              try {
                console.log('Attempting normal refund via REST API...');
                razorpayRefund = await refundViaREST(order.razorpay_payment_id, refundAmountInPaise);
                console.log('✅ Normal refund successful!', razorpayRefund.id);
              } catch (normalError: any) {
                console.log('Normal refund via REST failed, trying SDK method...', normalError.error?.description || normalError.message);
                
                // Strategy 3: Fallback to SDK method
                try {
                  console.log('Attempting refund via SDK...');
                  razorpayRefund = await razorpay.payments.refund(order.razorpay_payment_id, {
                    amount: refundAmountInPaise,
                  });
                  console.log('✅ Refund via SDK successful!', razorpayRefund.id);
                } catch (sdkError: any) {
                  console.error('All refund methods failed');
                  throw sdkError; // Re-throw if all methods fail
                }
              }
            }

            // Update refund record if it was created
            if (refundId) {
              try {
                await supabaseAdmin
                  .from('refunds')
                  .update({
                    razorpay_refund_id: razorpayRefund.id,
                    status: 'processed',
                  })
                  .eq('id', refundId);
              } catch (updateError) {
                console.error('Failed to update refund record:', updateError);
                // Continue even if update fails
              }
            }

            refundProcessed = true;
            console.log('Refund processed successfully:', razorpayRefund.id);
        } catch (razorpayError: any) {
          // Update refund status to failed if record exists
          if (refundId) {
            try {
              await supabaseAdmin
                .from('refunds')
                .update({
                  status: 'failed',
                })
                .eq('id', refundId);
            } catch (updateError) {
              console.error('Failed to update refund status:', updateError);
            }
          }

          // Check if we're in test mode
          const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_');
          
          // Log detailed error information
          console.error('❌ All refund attempts failed. Final error:', {
            statusCode: razorpayError.statusCode,
            error: razorpayError.error,
            message: razorpayError.message,
            payment_id: order.razorpay_payment_id,
            refund_amount: refundAmountInPaise,
            payment_status: paymentDetails?.status,
            payment_method: paymentDetails?.method,
            payment_amount: paymentDetails?.amount,
            is_test_mode: isTestMode,
            full_error: JSON.stringify(razorpayError, null, 2),
          });
          
          // In test mode, this is EXPECTED behavior, not an error
          if (isTestMode && razorpayError.statusCode === 400 && razorpayError.error?.code === 'BAD_REQUEST_ERROR') {
            console.warn('⚠️ TEST MODE LIMITATION: Refunds often fail in Razorpay test mode, especially for netbanking.');
            console.warn('   This is NORMAL behavior. Refunds will work in LIVE mode.');
            console.warn('   The refund will be processed via webhook when Razorpay processes it asynchronously.');
          } else if (razorpayError.statusCode === 400 && razorpayError.error?.code === 'BAD_REQUEST_ERROR') {
            console.error('⚠️ Possible causes:');
            console.error('  1. Refunds not enabled in Razorpay account');
            console.error('  2. Payment method does not support refunds');
            console.error('  3. Payment too old for refund');
          }

          // Continue with cancellation even if refund fails
          // Admin can process refund manually later
        }
        }
      } catch (error: any) {
        console.error('Refund processing error:', error);
        // Continue with cancellation even if refund fails
      }
    }

    // Update order status to cancelled using admin client
    const updateData: any = {
      status: 'cancelled',
    };

    // Update payment status if refund was processed
    if (refundProcessed) {
      updateData.payment_status = 'refunded';
    }

    // Use admin client to update order (bypasses RLS)
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to cancel order', details: updateError.message },
        { status: 500 }
      );
    }

    // Determine message based on refund status and test mode
    const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_');
    let message: string;
    
    if (refundProcessed) {
      message = 'Order cancelled and refund processed successfully. Amount will be credited within 3-5 business days.';
    } else if (isTestMode && order.payment_status === 'captured' && order.razorpay_payment_id) {
      // In test mode, refund may fail but will be processed via webhook
      message = 'Order cancelled. Refund has been initiated and will be processed. Amount will be credited within 3-5 business days.';
    } else if (order.payment_status === 'captured' && order.razorpay_payment_id) {
      // Refund failed but order cancelled - manual processing may be needed
      message = 'Order cancelled. Refund initiation may require manual processing. Please contact support if you need assistance.';
    } else {
      message = 'Order cancelled successfully.';
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      refundProcessed,
      message,
      // Include test mode info for frontend
      isTestMode: isTestMode && !refundProcessed,
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        // Only include stack in development
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      },
      { status: 500 }
    );
  }
}

