'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { loadRazorpay } from '@/utils/razorpay';
import { supabase } from '@/lib/supabase';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryCharge] = useState(50);
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    pincode: '',
    city: '',
    state: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('cod');

  useEffect(() => {
    // Check for user session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        alert('Please sign in to continue');
        router.push('/');
        return;
      }
      setUser(session.user);
      
      // Fetch saved addresses
      await fetchAddresses(session.access_token);
    });

    const cart = localStorage.getItem('cart');
    if (cart) {
      setCartItems(JSON.parse(cart));
    } else {
      router.push('/cart');
    }
  }, [router]);

  const fetchAddresses = async (accessToken: string) => {
    try {
      const response = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses || []);
        
        // Auto-select default address if exists
        const defaultAddress = data.addresses?.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          selectAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const selectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);
    setFormData({
      name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      pincode: address.pincode,
      city: address.city,
      state: address.state,
    });
  };

  const handleAddNewAddress = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId(null);
    setFormData({
      name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      pincode: '',
      city: '',
      state: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveOrderToDatabase = async (
    razorpayOrderId?: string,
    razorpayPaymentId?: string
  ) => {
    try {
      // Get user's access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const shippingAddress = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address_line1 + (formData.address_line2 ? `, ${formData.address_line2}` : ''),
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
      };

      // Save address if user wants to save it
      if (saveAddress && !selectedAddressId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const addressResponse = await fetch('/api/addresses', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                full_name: formData.name,
                phone: formData.phone,
                address_line1: formData.address_line1,
                address_line2: formData.address_line2,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                is_default: savedAddresses.length === 0, // Set as default if first address
              }),
            });
            
            if (addressResponse.ok) {
              // Refresh addresses list
              await fetchAddresses(session.access_token);
            }
          } catch (error) {
            console.error('Error saving address:', error);
            // Continue with order even if address save fails
          }
        }
      }

      const orderItems = cartItems.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          orderItems,
          shippingAddress,
          totalAmount: total,
          paymentMethod: paymentMethod === 'cod' ? 'cod' : 'upi',
          razorpayOrderId,
          razorpayPaymentId,
          accessToken: session.access_token, // Pass the access token
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to continue');
      return;
    }

    // If COD, save order and redirect
    if (paymentMethod === 'cod') {
      try {
        const order = await saveOrderToDatabase();
        // Clear cart
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        router.push(`/order-success?order=${order.order_number}`);
      } catch (error) {
        alert('Failed to create order. Please try again.');
      }
      return;
    }

    // If UPI, process Razorpay payment
    if (paymentMethod === 'upi') {
      await handlePayment();
    }
  };

  const handlePayment = async () => {
    try {
      // Load Razorpay script
      await loadRazorpay();

      // Create order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const order = await res.json();

      // Get product names for description
      const productNames = cartItems.map(item => item.name).join(', ');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'AGRICORNS',
        description: `Order: ${productNames}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Payment successful - save order to database
          try {
            const order = await saveOrderToDatabase(
              response.razorpay_order_id,
              response.razorpay_payment_id
            );
            // Clear cart
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('cartUpdated'));
            // Redirect to success page with order number
            router.push(`/order-success?order=${order.order_number}`);
          } catch (error) {
            console.error('Error saving order after payment:', error);
            alert('Payment successful but failed to save order. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: '', // Add email field if needed
        },
        theme: {
          color: '#2d5016',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryCharge;

  if (cartItems.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#2d5016] mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Address Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="font-heading font-semibold text-xl text-gray-900 mb-6">
                  Delivery Address
                </h2>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="mb-6 space-y-3">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => selectAddress(address)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === address.id
                            ? 'border-[#2d5016] bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">{address.full_name}</span>
                              {address.is_default && (
                                <span className="text-xs bg-[#2d5016] text-white px-2 py-1 rounded">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                          </div>
                          <div className="ml-4">
                            <input
                              type="radio"
                              checked={selectedAddressId === address.id}
                              onChange={() => selectAddress(address)}
                              className="w-5 h-5 text-[#2d5016] focus:ring-[#2d5016]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2d5016] hover:text-[#2d5016] transition-colors font-medium"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* New Address Form or Edit Form */}
                {(showNewAddressForm || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewAddressForm(false);
                          const defaultAddress = savedAddresses.find(addr => addr.is_default) || savedAddresses[0];
                          if (defaultAddress) selectAddress(defaultAddress);
                        }}
                        className="text-[#2d5016] hover:underline text-sm font-medium mb-4"
                      >
                        ← Use Saved Address
                      </button>
                    )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 * (House/Flat No., Building, Street)
                    </label>
                    <input
                      type="text"
                      name="address_line1"
                      required
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                      placeholder="House/Flat No., Building, Street, Area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2 (Optional - Landmark, Area)
                    </label>
                    <input
                      type="text"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                      placeholder="Landmark, Area (Optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  {/* Save Address Checkbox */}
                  {!selectedAddressId && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 text-[#2d5016] border-gray-300 rounded focus:ring-[#2d5016]"
                      />
                      <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700">
                        Save this address for future orders
                      </label>
                    </div>
                  )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="font-heading font-semibold text-xl text-gray-900 mb-6">
                  Payment Method
                </h2>
                
                {/* Test Mode Notice */}
                {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.includes('test') && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">🧪 Test Mode Active</p>
                    <p className="text-xs text-yellow-700 mb-2">Use these test credentials:</p>
                    <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                      <li><strong>Indian Card:</strong> 5267 3181 8797 5449 | 12/25 | 123</li>
                      <li><strong>UPI:</strong> success@razorpay (always succeeds)</li>
                      <li><strong>Netbanking:</strong> Select any bank (auto-success)</li>
                    </ul>
                  </div>
                )}
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mr-4 w-5 h-5 text-[#2d5016] focus:ring-[#2d5016]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Cash on Delivery (COD)</div>
                      <div className="text-sm text-gray-500">Pay when you receive</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mr-4 w-5 h-5 text-[#2d5016] focus:ring-[#2d5016]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">UPI Payment</div>
                      <div className="text-sm text-gray-500">Pay via UPI (Google Pay, PhonePe, etc.)</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
                <h2 className="font-heading font-semibold text-xl text-gray-900 mb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-700">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-300 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery</span>
                    <span>₹{deliveryCharge}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between">
                    <span className="font-heading font-bold text-lg text-gray-900">Total</span>
                    <span className="font-heading font-bold text-lg text-[#2d5016]">
                      ₹{total}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-[#2d5016] text-white rounded-lg font-heading font-semibold text-lg hover:bg-[#1f3509] shadow-lg hover:shadow-xl transition-all"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

