import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export async function POST(req: Request) {
  try {
    const {
      userId,
      orderItems,
      shippingAddress,
      totalAmount,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      accessToken, // User's session token
    } = await req.json();

    // Create authenticated Supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Verify the user matches the userId
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid user session' },
        { status: 401 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'created',
        amount: totalAmount,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        razorpay_order_id: razorpayOrderId || null,
        razorpay_payment_id: razorpayPaymentId || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Create order items
    // Note: product_id is set to null since we're using local product data
    // If you want to link to database products, you'll need to map local IDs to DB UUIDs
    const orderItemsData = orderItems.map((item: any) => ({
      order_id: order.id,
      product_id: null, // Set to null since we're using local product IDs, not DB UUIDs
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Try to delete the order if items fail
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items', details: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

