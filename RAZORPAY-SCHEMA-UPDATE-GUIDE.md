# Razorpay Schema Update Guide

This guide explains the database schema improvements for proper Razorpay integration, refunds, and webhook handling.

## 🎯 What Changed

### 1. **Refunds Table** (NEW - CRITICAL)
A dedicated `refunds` table was added to support:
- ✅ Full refunds
- ✅ Partial refunds
- ✅ Multiple refunds per order
- ✅ Retry handling
- ✅ Razorpay webhook integration

**Table Structure:**
```sql
refunds (
  id: uuid (PK)
  order_id: uuid (FK → orders)
  razorpay_refund_id: text (UNIQUE)
  amount: numeric
  status: 'initiated' | 'processed' | 'failed'
  reason: text
  created_at: timestamp
  updated_at: timestamp
)
```

### 2. **Payment Status Enum** (UPDATED)
Updated `orders.payment_status` to match Razorpay's actual lifecycle:

**Old values:** `'pending' | 'paid' | 'failed'`  
**New values:** `'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded'`

**Mapping:**
- `pending` → `created`
- `paid` → `captured`
- `failed` → `failed` (unchanged)

### 3. **Webhook Security** (NEW)
Added `razorpay_signature` field to `orders` table for webhook signature verification.

### 4. **Settlement Tracking** (NEW - Optional)
Added fields for financial reconciliation:
- `settlement_id`: Razorpay settlement ID
- `settled_at`: When the order was settled

## 📋 Migration Steps

### Step 1: Run SQL Migration
Execute the SQL file in your Supabase SQL Editor:

```bash
# File: supabase-razorpay-schema-updates.sql
```

Or copy-paste the contents into Supabase Dashboard → SQL Editor → New Query

### Step 2: Update Environment Variables
Add to your `.env.local`:

```env
# Razorpay Webhook Secret (get from Razorpay Dashboard → Settings → Webhooks)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 3: Configure Razorpay Webhook
In Razorpay Dashboard:
1. Go to **Settings → Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
   - `refund.processed`
   - `order.paid`
4. Copy the **Webhook Secret** to your `.env.local`

## 🔄 Order Lifecycle

### Payment Flow (Independent)
```
created → authorized → captured → refunded
```

### Business Flow (Independent)
```
created → paid → shipped → delivered
```

**Example:** An order can be `captured` (payment) but still `created` (business status).

## 💰 Refund Flow

### Full Refund
```typescript
POST /api/refunds/create
{
  "orderId": "order-uuid",
  "reason": "Customer request"
}
```

### Partial Refund
```typescript
POST /api/refunds/create
{
  "orderId": "order-uuid",
  "amount": 500, // Partial amount
  "reason": "Damaged item"
}
```

**What happens:**
1. Refund record created in `refunds` table (status: `initiated`)
2. Razorpay refund API called
3. Refund record updated (status: `processed`)
4. Order `payment_status` auto-updated via trigger:
   - Full refund → `refunded`
   - Partial refund → `partially_refunded`

## 🔐 Webhook Security

The webhook handler verifies signatures to prevent fake callbacks:

```typescript
// Automatically verified in /api/razorpay/webhook
const signature = req.headers.get('x-razorpay-signature');
// Verified using RAZORPAY_WEBHOOK_SECRET
```

## 📊 Database Triggers

### Auto-Update Payment Status on Refund
A trigger automatically updates `orders.payment_status` when a refund is processed:

- **Full refund** → `payment_status = 'refunded'`
- **Partial refund** → `payment_status = 'partially_refunded'`

## 🧪 Testing

### Test Refund Creation
```bash
curl -X POST http://localhost:3000/api/refunds/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "your-order-id",
    "amount": 100,
    "reason": "Test refund"
  }'
```

### Test Webhook (Local)
Use Razorpay's webhook testing tool or ngrok:

```bash
# Install ngrok
ngrok http 3000

# Update Razorpay webhook URL to ngrok URL
# https://your-ngrok-url.ngrok.io/api/razorpay/webhook
```

## 🔍 RLS Policies

### Refunds Table
- **Users:** Can view their own refunds (via order ownership)
- **Admins:** Can view all refunds
- **Service Role:** Full access (for API routes)

## 📝 API Routes

### 1. Create Refund
`POST /api/refunds/create`
- Requires: `orderId`, optional `amount`, optional `reason`
- Returns: Refund details with Razorpay refund ID

### 2. Razorpay Webhook
`POST /api/razorpay/webhook`
- Handles: payment events, refund events
- Auto-updates: Order status, refund status

## 🚨 Important Notes

1. **Payment Status vs Business Status:**
   - `payment_status`: Tracks payment lifecycle (Razorpay)
   - `status`: Tracks business flow (shipping, delivery)

2. **Refunds are Immutable:**
   - Once `processed`, refunds cannot be modified
   - Create a new refund for additional refunds

3. **Partial Refunds:**
   - Multiple partial refunds allowed
   - Total refunded amount tracked automatically
   - Order status updates when total = order amount

4. **Webhook Retries:**
   - Razorpay retries failed webhooks
   - Handler is idempotent (safe to retry)

## ✅ Checklist

- [ ] Run SQL migration in Supabase
- [ ] Add `RAZORPAY_WEBHOOK_SECRET` to `.env.local`
- [ ] Configure webhook in Razorpay Dashboard
- [ ] Test refund creation API
- [ ] Test webhook with Razorpay test events
- [ ] Update frontend to handle new payment_status values

## 🆘 Troubleshooting

### Refund fails with "Order not found"
- Check `razorpay_payment_id` exists on order
- Verify order exists in database

### Webhook returns 401
- Verify `RAZORPAY_WEBHOOK_SECRET` matches Razorpay Dashboard
- Check webhook signature header is present

### Payment status not updating
- Check database trigger is active
- Verify refund status is `processed`
- Check Supabase logs for trigger errors

## 📚 Additional Resources

- [Razorpay Refunds API](https://razorpay.com/docs/api/refunds/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)






