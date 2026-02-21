'use client';
export const dynamic = "force-dynamic";


import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaPlus, FaArrowLeft, FaInfoCircle, FaLightbulb, FaSave } from 'react-icons/fa';
import { store } from '@/lib/store';

export default function AddStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;

  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isEdit && editId) {
      const item = store.getStockItem(editId);
      if (item) {
        setFormData({
          itemName: item.itemName,
          quantity: item.quantity.toString(),
          unit: item.unit,
          description: item.description,
          date: item.date || item.createdAt.split('T')[0],
        });
      }
    }
  }, [isEdit, editId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemName.trim() || !formData.quantity || !formData.unit) {
      alert('Please fill in all required fields');
      return;
    }

    if (isEdit && editId) {
      store.updateStockItem(editId, {
        itemName: formData.itemName,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        description: formData.description,
        date: formData.date,
      });
    } else {
      const stockItem = {
        id: Date.now().toString(),
        itemName: formData.itemName,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        description: formData.description,
        date: formData.date,
        createdAt: new Date().toISOString(),
      };
      store.addStockItem(stockItem);
    }
    router.push('/stock');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaPlus className="text-2xl" />
            <h1 className="text-3xl font-bold">{isEdit ? 'Edit Stock Item' : 'Add Stock Item'}</h1>
          </div>
          <Link
            href="/stock"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>← Back to Stock</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Stock Item Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                      <option value="mL">mL</option>
                      <option value="pieces">pieces</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Optional description..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push('/stock')}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaSave />
                    <span>{isEdit ? 'Update Stock Item' : 'Save Stock Item'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Guidelines */}
          <div className="space-y-6">
            {/* Stock Guidelines */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Stock Guidelines</h2>
              
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FaInfoCircle className="text-blue-600" />
                  <h3 className="font-semibold">Stock Levels</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm">Low</span>
                    <span className="text-sm text-gray-600">Less than 10 units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm">Medium</span>
                    <span className="text-sm text-gray-600">10-50 units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">Good</span>
                    <span className="text-sm text-gray-600">More than 50 units</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <FaLightbulb className="text-yellow-500" />
                  <h3 className="font-semibold">Tips</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Update stock regularly</li>
                  <li>• Set minimum stock alerts</li>
                  <li>• Track expiration dates</li>
                  <li>• Monitor usage patterns</li>
                </ul>
              </div>
            </div>

            {/* Common Raw Materials */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Common Raw Materials</h2>
              <div className="space-y-3">
                <div>
                  <div className="font-semibold">Sugar</div>
                  <div className="text-sm text-gray-600">Primary sweetener for pedha</div>
                </div>
                <div>
                  <div className="font-semibold">Milk</div>
                  <div className="text-sm text-gray-600">Fresh milk for pedha base</div>
                </div>
                <div>
                  <div className="font-semibold">Ghee</div>
                  <div className="text-sm text-gray-600">Clarified butter for flavor</div>
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
