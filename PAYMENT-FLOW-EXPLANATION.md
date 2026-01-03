# Payment Flow & Webhook Explanation

## 🔄 Current Payment Flow

### Normal Payment (Current Implementation)

**Flow:**
1. User clicks "Pay Now" → Razorpay checkout opens
2. User completes payment → Razorpay returns success
3. **Handler callback** (in `checkout/page.tsx` line 274) immediately:
   - Saves order to database via `/api/save-order`
   - Sets `payment_status = 'captured'`
   - Redirects to success page

**Pros:**
- ✅ Immediate order creation
- ✅ Fast user experience
- ✅ No waiting for webhooks

**Cons:**
- ⚠️ If user closes browser before callback, order might not be saved
- ⚠️ No backup verification

### Webhook Flow (Available but Not Primary)

**Webhook Handler:** `/api/razorpay/webhook`

**Events Handled:**
- `payment.captured` → Updates order `payment_status` to `captured`
- `payment.failed` → Updates order `payment_status` to `failed`
- `refund.created` / `refund.processed` → Updates refund status
- `order.paid` → Updates order `payment_status` to `captured`

**Current Status:**
- ✅ Webhook handler exists and is functional
- ✅ Signature verification implemented
- ⚠️ **Not currently used as primary flow** (order saved in handler callback)
- ✅ **Serves as backup** - if handler fails, webhook will update status

## 🎯 Recommendation: Hybrid Approach

**Best Practice:**
1. **Primary:** Save order in handler callback (current - fast UX)
2. **Backup:** Webhook updates payment_status (current - reliability)
3. **Verification:** Webhook ensures payment_status is correct even if callback fails

**This is already implemented!** ✅

The webhook acts as a safety net:
- If handler callback fails → Webhook will still update payment_status
- If user closes browser → Webhook will update payment_status when Razorpay sends event
- If network issues → Webhook ensures eventual consistency

## 📋 Webhook Setup

### Required Environment Variable
```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay_dashboard
```

### Razorpay Dashboard Configuration
1. Go to **Settings → Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
3. Select events:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `refund.created`
   - ✅ `refund.processed`
   - ✅ `order.paid`
4. Copy **Webhook Secret** to `.env.local`

## 🚫 Order Cancellation

### User Cancellation (NEW)

**Location:** `/orders` page (My Orders)

**Features:**
- ✅ Cancel button appears for cancellable orders
- ✅ Can cancel if order status is: `created` or `paid`
- ❌ Cannot cancel if: `shipped`, `delivered`, or already `cancelled`
- ✅ Automatic refund if payment was captured
- ✅ Updates order status to `cancelled`
- ✅ Updates payment_status to `refunded` (if refund processed)

**API:** `POST /api/orders/cancel`

**Flow:**
1. User clicks "Cancel Order"
2. Confirmation dialog appears
3. If confirmed:
   - Check if payment was captured
   - If yes → Create refund via Razorpay
   - Update order status to `cancelled`
   - Update payment_status to `refunded` (if refund successful)

## 🔍 Payment Status Lifecycle

### Payment Status (Razorpay)
```
created → authorized → captured → refunded
```

### Business Status (Order Fulfillment)
```
created → paid → shipped → delivered
```

**These are independent!** An order can be:
- `captured` (payment) but `created` (business)
- `refunded` (payment) but `cancelled` (business)

## ✅ Summary

### Current Implementation ✅
- ✅ Order saved immediately in payment handler (fast UX)
- ✅ Webhook handler exists (backup/reliability)
- ✅ Order cancellation with automatic refunds
- ✅ Proper payment status tracking

### What's Working
1. **Payment Flow:** Handler callback saves order immediately
2. **Webhook Backup:** Webhook updates payment_status as backup
3. **Cancellation:** Users can cancel orders with automatic refunds
4. **Status Tracking:** Separate payment and business status

### Next Steps (Optional)
- [ ] Add webhook retry logic for failed webhook processing
- [ ] Add admin notification when order is cancelled
- [ ] Add cancellation reason field to orders table
- [ ] Add refund history display in order details

## 🧪 Testing

### Test Payment Flow
1. Complete a payment
2. Check order is created immediately
3. Verify webhook updates payment_status (check Supabase logs)

### Test Cancellation
1. Create an order with payment
2. Go to My Orders
3. Click "Cancel Order"
4. Verify refund is processed
5. Check order status is `cancelled`
6. Check payment_status is `refunded`

### Test Webhook
1. Use Razorpay test webhook tool
2. Send `payment.captured` event
3. Verify order payment_status updates






