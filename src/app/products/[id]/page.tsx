'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductAIAssistant from '@/components/ProductAIAssistant';
import ImageCarousel from '@/components/ImageCarousel';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  weight: string;
  image_url: string;
  images?: string[] | null;
  ingredients: string[] | null;
  health_benefits: string[] | null;
  how_to_use: string[] | null;
  nutrition_facts: any;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'benefits' | 'usage' | 'nutrition' | 'disclaimer'>('ingredients');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      // Try to find by ID first (for backward compatibility)
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        // If not found, try fetching all and finding by ID
        const allResponse = await fetch('/api/products');
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const found = allData.products.find((p: Product) => p.id === params.id || p.slug === params.id);
          if (found) {
            setProduct(found);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/products" className="text-[#2d5016] hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    const cart = localStorage.getItem('cart');
    const cartItems = cart ? JSON.parse(cart) : [];
    
    const existingItem = cartItems.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({ ...product, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/checkout');
    }, 500);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-[#f4d03f]' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link href="/products" className="text-[#2d5016] hover:underline text-sm sm:text-base min-h-[44px] inline-flex items-center">
            ← Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16 lg:mb-12">
          {/* Product Image Gallery */}
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden bg-gray-100 shadow-lg">
            {(() => {
              // Get images array or fallback to single image_url
              const images = product.images && product.images.length > 0 
                ? product.images 
                : (product.image_url ? [product.image_url] : []);
              
              return <ImageCarousel images={images} alt={product.name} className="h-full" showArrowsOnHover={false} />;
            })()}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#2d5016] mb-2">
              {product.name}
            </h1>
            <p className="text-gray-500 mb-4">{product.weight}</p>
            
            <div className="flex items-center space-x-2 mb-4">
              {renderStars(4.5)}
              <span className="text-gray-600">(4.5)</span>
            </div>

            <div className="mb-6">
              <span className="font-heading font-bold text-4xl text-[#2d5016]">
                ₹{product.price}
              </span>
            </div>

            <p className="text-gray-700 mb-6">{product.description || 'Premium quality organic product.'}</p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <label className="font-medium text-gray-700 text-sm sm:text-base">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center text-lg"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-4 sm:px-6 py-2 font-medium min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center text-lg"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleBuyNow}
                className="flex-1 px-6 py-4 bg-[#2d5016] text-white rounded-lg font-heading font-semibold text-lg hover:bg-[#1f3509] shadow-lg hover:shadow-xl transition-all"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 px-6 py-4 border-2 border-[#2d5016] text-[#2d5016] rounded-lg font-heading font-semibold text-lg hover:bg-[#2d5016] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌿</span>
                <span className="text-sm font-medium text-gray-700">100% Organic</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔬</span>
                <span className="text-sm font-medium text-gray-700">Lab Tested</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🇮🇳</span>
                <span className="text-sm font-medium text-gray-700">Made in India</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚚</span>
                <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Information Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'ingredients'
                  ? 'text-[#2d5016] border-b-2 border-[#2d5016]'
                  : 'text-gray-600 hover:text-[#2d5016]'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'benefits'
                  ? 'text-[#2d5016] border-b-2 border-[#2d5016]'
                  : 'text-gray-600 hover:text-[#2d5016]'
              }`}
            >
              Health Benefits
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'usage'
                  ? 'text-[#2d5016] border-b-2 border-[#2d5016]'
                  : 'text-gray-600 hover:text-[#2d5016]'
              }`}
            >
              How to Use
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'nutrition'
                  ? 'text-[#2d5016] border-b-2 border-[#2d5016]'
                  : 'text-gray-600 hover:text-[#2d5016]'
              }`}
            >
              Nutrition Facts
            </button>
            <button
              onClick={() => setActiveTab('disclaimer')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'disclaimer'
                  ? 'text-[#2d5016] border-b-2 border-[#2d5016]'
                  : 'text-gray-600 hover:text-[#2d5016]'
              }`}
            >
              Disclaimer
            </button>
          </div>

          <div className="py-6">
            {activeTab === 'ingredients' && (
              <div>
                <h3 className="font-heading font-semibold text-xl mb-4">Ingredients</h3>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <ul className="space-y-2">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#2d5016] mr-2">•</span>
                        <span className="text-gray-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No ingredients listed.</p>
                )}
              </div>
            )}

            {activeTab === 'benefits' && (
              <div>
                <h3 className="font-heading font-semibold text-xl mb-4">Health Benefits</h3>
                {product.health_benefits && product.health_benefits.length > 0 ? (
                  <ul className="space-y-2">
                    {product.health_benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#2d5016] mr-2">•</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No health benefits listed.</p>
                )}
              </div>
            )}

            {activeTab === 'usage' && (
              <div>
                <h3 className="font-heading font-semibold text-xl mb-4">How to Use</h3>
                {product.how_to_use && product.how_to_use.length > 0 ? (
                  <ul className="space-y-2">
                    {product.how_to_use.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#2d5016] mr-2">•</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No usage instructions listed.</p>
                )}
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <h3 className="font-heading font-semibold text-xl mb-4">Nutrition Facts</h3>
                {product.nutrition_facts ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <tbody>
                        {product.nutrition_facts.servingSize && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 font-medium bg-gray-50">Serving Size</td>
                            <td className="px-4 py-3">{product.nutrition_facts.servingSize}</td>
                          </tr>
                        )}
                        {product.nutrition_facts.calories !== undefined && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 font-medium bg-gray-50">Calories</td>
                            <td className="px-4 py-3">{product.nutrition_facts.calories}</td>
                          </tr>
                        )}
                        {product.nutrition_facts.protein && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 font-medium bg-gray-50">Protein</td>
                            <td className="px-4 py-3">{product.nutrition_facts.protein}</td>
                          </tr>
                        )}
                        {product.nutrition_facts.carbs && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 font-medium bg-gray-50">Carbohydrates</td>
                            <td className="px-4 py-3">{product.nutrition_facts.carbs}</td>
                          </tr>
                        )}
                        {product.nutrition_facts.fat && (
                          <tr className="border-b border-gray-200">
                            <td className="px-4 py-3 font-medium bg-gray-50">Fat</td>
                            <td className="px-4 py-3">{product.nutrition_facts.fat}</td>
                          </tr>
                        )}
                        {product.nutrition_facts.fiber && (
                          <tr>
                            <td className="px-4 py-3 font-medium bg-gray-50">Fiber</td>
                            <td className="px-4 py-3">{product.nutrition_facts.fiber}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No nutrition facts available.</p>
                )}
              </div>
            )}

            {activeTab === 'disclaimer' && (
              <div>
                <h3 className="font-heading font-semibold text-xl mb-4">Disclaimer</h3>
                <p className="text-gray-700 leading-relaxed">
                  These statements have not been evaluated by the Food and Drug Administration. 
                  This product is not intended to diagnose, treat, cure, or prevent any disease. 
                  Results may vary from person to person. Please consult with a healthcare 
                  professional before starting any new dietary supplement, especially if you are 
                  pregnant, nursing, or have a medical condition.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Buy Now Button for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 sm:p-4 z-40 safe-area-inset-bottom">
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 px-4 py-3 border-2 border-[#2d5016] text-[#2d5016] rounded-lg font-medium disabled:opacity-50 min-h-[48px] text-sm sm:text-base"
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 px-4 py-3 bg-[#2d5016] text-white rounded-lg font-medium hover:bg-[#1f3509] min-h-[48px] text-sm sm:text-base"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* AI Assistant */}
      {product && <ProductAIAssistant product={product} />}
    </div>
  );
}

