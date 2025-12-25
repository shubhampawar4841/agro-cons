'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';


interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  weight: string;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  ingredients: string[] | null;
  health_benefits: string[] | null;
  how_to_use: string[] | null;
  nutrition_facts: any;
  created_at: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    weight: '',
    image_url: '',
    stock_quantity: '0',
    is_active: true,
    ingredients: '',
    health_benefits: '',
    how_to_use: '',
    nutrition_facts: JSON.stringify({
      servingSize: '',
      calories: 0,
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
    }, null, 2),
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    checkAdminAndFetchProducts();
  }, []);

  const checkAdminAndFetchProducts = async () => {
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
      await fetchProducts(session.access_token);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (accessToken: string) => {
    const response = await fetch('/api/admin/products', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setProducts(data.products || []);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type. Skipping.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB). Skipping.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    if (selectedFiles.length === 0) {
      // Return empty array - existing images are handled separately
      return [];
    }

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Upload all selected files
      for (const file of selectedFiles) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: uploadFormData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || `Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(error.message || 'Failed to upload images');
      return uploadedImages; // Return existing images on error
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Upload images first if new files are selected
      let images: string[] = [...uploadedImages]; // Preserve existing images
      if (selectedFiles.length > 0) {
        const uploadedUrls = await handleImageUpload();
        if (uploadedUrls.length === 0 && images.length === 0) {
          alert('Please upload at least one image');
          return;
        }
        // Combine existing images with newly uploaded ones
        images = [...uploadedImages, ...uploadedUrls];
      } else if (formData.image_url && images.length === 0) {
        // Fallback to single image_url if no images array
        images = [formData.image_url];
      }

      if (images.length === 0) {
        alert('Please upload at least one image or provide an image URL');
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        weight: formData.weight,
        image_url: images[0], // Keep first image as image_url for backward compatibility
        images: images, // New images array
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        ingredients: formData.ingredients ? formData.ingredients.split('\n').filter(Boolean) : null,
        health_benefits: formData.health_benefits ? formData.health_benefits.split('\n').filter(Boolean) : null,
        how_to_use: formData.how_to_use ? formData.how_to_use.split('\n').filter(Boolean) : null,
        nutrition_facts: formData.nutrition_facts ? JSON.parse(formData.nutrition_facts) : null,
      };

      let response;
      if (editingProduct && editingProduct.id) {
        // Update existing product
        console.log('Updating product with ID:', editingProduct.id);
        response = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Create new product
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('Product save error:', error);
        throw new Error(error.details || error.error || 'Failed to save product');
      }

      // Refresh products
      await fetchProducts(session.access_token);
      
      // Reset form
      setShowAddForm(false);
      setEditingProduct(null);
      setSelectedFiles([]);
      setImagePreviews([]);
      setUploadedImages([]);
      resetForm();
      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    if (!product.id) {
      alert('Error: Product ID is missing. Cannot edit this product.');
      console.error('Product missing ID:', product);
      return;
    }
    console.log('Editing product:', product.id, product.name);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      weight: product.weight,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity.toString(),
      is_active: product.is_active,
      ingredients: product.ingredients?.join('\n') || '',
      health_benefits: product.health_benefits?.join('\n') || '',
      how_to_use: product.how_to_use?.join('\n') || '',
      nutrition_facts: JSON.stringify(product.nutrition_facts || {}, null, 2),
    });
    // Set existing images if available
    const existingImages = (product as any).images || (product.image_url ? [product.image_url] : []);
    setUploadedImages(existingImages);
    setImagePreviews([]);
    setSelectedFiles([]);
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        await fetchProducts(session.access_token);
        alert('Product deleted successfully!');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      weight: '',
      image_url: '',
      stock_quantity: '0',
      is_active: true,
      ingredients: '',
      health_benefits: '',
      how_to_use: '',
      nutrition_facts: JSON.stringify({
        servingSize: '',
        calories: 0,
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
      }, null, 2),
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setUploadedImages([]);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#2d5016] mb-2">
              Product Management
            </h1>
            <p className="text-gray-600">
              Add, edit, and manage products
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowAddForm(true);
            }}
            className="px-6 py-3 bg-[#2d5016] text-white rounded-lg font-heading font-semibold hover:bg-[#1f3509]"
          >
            + Add Product
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g., 100g, 250g, 500g"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images * (Multiple images supported)
                  </label>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#2d5016] file:text-white
                        hover:file:bg-[#1f3509] file:cursor-pointer
                        cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      JPEG, PNG, or WebP. Max size: 5MB per image. You can select multiple images.
                    </p>
                  </div>

                  {/* Uploaded Images Preview (Existing) */}
                  {uploadedImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Existing Images:</p>
                      <div className="grid grid-cols-4 gap-3">
                        {uploadedImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-full h-24 border border-gray-300 rounded-lg overflow-hidden">
                              <Image
                                src={url}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized={url.includes('supabase.co')}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUploadedImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Preview */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">New Images to Upload:</p>
                      <div className="grid grid-cols-4 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-full h-24 border border-gray-300 rounded-lg overflow-hidden">
                              <Image
                                src={preview}
                                alt={`New image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback: URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter Image URL (if not uploading)
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        // If no new files selected, allow URL input as fallback
                        if (selectedFiles.length === 0 && uploadedImages.length === 0) {
                          // URL input is just for fallback, images array is primary
                        }
                      }}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients (one per line)
                  </label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    rows={4}
                    placeholder="100% Organic Moringa Leaves"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Health Benefits (one per line)
                  </label>
                  <textarea
                    value={formData.health_benefits}
                    onChange={(e) => setFormData({ ...formData, health_benefits: e.target.value })}
                    rows={4}
                    placeholder="Rich in Vitamin A, C, and E"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How to Use (one per line)
                  </label>
                  <textarea
                    value={formData.how_to_use}
                    onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })}
                    rows={4}
                    placeholder="Mix 1 teaspoon in smoothies"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nutrition Facts (JSON)
                  </label>
                  <textarea
                    value={formData.nutrition_facts}
                    onChange={(e) => setFormData({ ...formData, nutrition_facts: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-[#2d5016] focus:ring-[#2d5016]"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-[#2d5016] text-white rounded-lg font-heading font-semibold hover:bg-[#1f3509] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={uploading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-heading font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white border rounded-lg overflow-hidden shadow-sm ${
                !product.is_active ? 'opacity-60 border-gray-300' : 'border-gray-200'
              }`}
            >
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={product.image_url.includes('supabase.co')}
                  onError={(e) => {
                    // Fallback to placeholder on error
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (!target.parentElement?.querySelector('.image-placeholder')) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'image-placeholder w-full h-full flex items-center justify-center bg-gray-200';
                      placeholder.textContent = product.name;
                      target.parentElement?.appendChild(placeholder);
                    }
                  }}
                />
                {!product.is_active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.weight}</p>
                <p className="font-heading font-bold text-lg text-[#2d5016] mb-4">
                  ₹{product.price}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-4 py-2 bg-[#2d5016] text-white rounded-lg text-sm font-medium hover:bg-[#1f3509]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !showAddForm && (
          <div className="text-center py-16">
            <p className="text-gray-600">No products yet. Add your first product!</p>
          </div>
        )}
      </div>
    </div>
  );
}

