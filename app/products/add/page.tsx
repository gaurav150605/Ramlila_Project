'use client';

import { Suspense, useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaPlus, FaArrowLeft, FaInfoCircle, FaLightbulb, FaSave } from 'react-icons/fa';
import { store } from '@/lib/store';

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;

  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    unit: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    if (isEdit && editId) {
      const product = store.getProduct(editId);
      if (product) {
        setFormData({
          productName: product.name,
          price: product.price.toString(),
          unit: product.unit,
          category: product.category || '',
          description: product.description,
        });
      }
    }
  }, [isEdit, editId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName.trim() || !formData.price || !formData.unit) {
      alert('Please fill in all required fields');
      return;
    }

    if (isEdit && editId) {
      store.updateProduct(editId, {
        name: formData.productName,
        description: formData.description,
        price: Number(formData.price),
        unit: formData.unit,
        category: formData.category || undefined,
      });
    } else {
      const product = {
        id: Date.now().toString(),
        name: formData.productName,
        description: formData.description,
        price: Number(formData.price),
        unit: formData.unit,
        category: formData.category || undefined,
        created: new Date().toISOString(),
      };
      store.addProduct(product);
    }
    router.push('/products');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaPlus className="text-2xl" />
            <h1 className="text-3xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          </div>
          <Link
            href="/products"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>← Back to Products</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Product Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Premium">Premium</option>
                    <option value="Special">Special</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    placeholder="Describe the product, ingredients, special features..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push('/products')}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaSave />
                    <span>{isEdit ? 'Update Product' : 'Save Product'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Guidelines */}
          <div className="space-y-6">
            {/* Product Guidelines */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Product Guidelines</h2>
              
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FaInfoCircle className="text-blue-600" />
                  <h3 className="font-semibold">Product Categories</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">Traditional</span>
                    <span className="text-sm text-gray-600">Classic pedha varieties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm">Premium</span>
                    <span className="text-sm text-gray-600">High-quality ingredients</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">Special</span>
                    <span className="text-sm text-gray-600">Unique flavors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-md text-sm">Seasonal</span>
                    <span className="text-sm text-gray-600">Limited time products</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FaLightbulb className="text-yellow-500" />
                  <h3 className="font-semibold">Tips</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use descriptive names</li>
                  <li>• Set competitive prices</li>
                  <li>• Include key ingredients</li>
                  <li>• Mention special features</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Popular Pedha Types</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-semibold">Kesar Pedha</div>
                    <div className="text-gray-600">Saffron-flavored premium pedha</div>
                  </div>
                  <div>
                    <div className="font-semibold">Chocolate Pedha</div>
                    <div className="text-gray-600">Modern twist with chocolate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>}>
      <AddProductForm />
    </Suspense>
  );
}
