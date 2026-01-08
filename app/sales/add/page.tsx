'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaShoppingCart, FaBars, FaArrowLeft, FaSave } from 'react-icons/fa';
import { store, type Product } from '@/lib/store';

interface ProductRow {
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export default function AddSalePage() {
  const router = useRouter();
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [products, setProducts] = useState<ProductRow[]>([
    { productId: '', quantity: 0, price: 0, total: 0 },
  ]);
  const [paymentInfo, setPaymentInfo] = useState({
    discount: 0,
    tax: 0,
    method: 'Cash',
    initialPayment: 0,
    paymentStatus: 'Unpaid' as 'Fully Paid' | 'Partially Paid' | 'Unpaid',
  });

  useEffect(() => {
    setAvailableProducts(store.getProducts());
  }, []);

  const updateProduct = (index: number, field: keyof ProductRow, value: string | number) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    
    if (field === 'productId') {
      const product = availableProducts.find((p) => p.id === value);
      if (product) {
        newProducts[index].price = product.price;
        newProducts[index].total = newProducts[index].quantity * product.price;
      }
    } else if (field === 'quantity') {
      newProducts[index].total = parseFloat(String(value)) * newProducts[index].price;
    }
    
    setProducts(newProducts);
  };

  const addProductRow = () => {
    setProducts([...products, { productId: '', quantity: 0, price: 0, total: 0 }]);
  };

  const subtotal = products.reduce((sum, p) => sum + p.total, 0);
  const totalAmount = subtotal - paymentInfo.discount + paymentInfo.tax;

  const handleSave = () => {
    // Validate required fields
    if (!customerInfo.name.trim()) {
      alert('Please enter customer name');
      return;
    }

    const validProducts = products.filter(p => p.productId && p.quantity > 0);
    if (validProducts.length === 0) {
      alert('Please add at least one product');
      return;
    }

    // Create sale object
    const sale = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      customer: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address || undefined,
      },
      products: validProducts.map(p => {
        const product = availableProducts.find(ap => ap.id === p.productId);
        return {
          productId: p.productId,
          productName: product?.name || '',
          quantity: p.quantity,
          price: p.price,
          total: p.total,
        };
      }),
      subtotal,
      discount: paymentInfo.discount,
      tax: paymentInfo.tax,
      total: totalAmount,
      paymentMethod: paymentInfo.method,
      paymentStatus: paymentInfo.initialPayment >= totalAmount ? 'Fully Paid' :
                     paymentInfo.initialPayment > 0 ? 'Partially Paid' : 'Unpaid',
      paidAmount: paymentInfo.initialPayment,
      remainingAmount: totalAmount - paymentInfo.initialPayment,
      payments: paymentInfo.initialPayment > 0 ? [{
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount: paymentInfo.initialPayment,
        paymentMethod: paymentInfo.method,
        notes: 'Initial payment',
      }] : [],
    };

    // Save to store
    store.addSale(sale);
    
    // Redirect to sales page
    router.push('/sales');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">+</span>
            <h1 className="text-3xl font-bold">Add New Sale (Multiple Products)</h1>
          </div>
          <Link
            href="/sales"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>← Back to Sales</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FaUser className="text-blue-600" />
                <h2 className="text-xl font-bold">Customer Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Address
                  </label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FaShoppingCart className="text-blue-600" />
                <h2 className="text-xl font-bold">Products</h2>
              </div>
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product *
                      </label>
                      <select
                        required
                        value={product.productId}
                        onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a product</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={product.quantity || ''}
                        onChange={(e) => updateProduct(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <input
                        type="number"
                        value={product.price}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total
                      </label>
                      <input
                        type="number"
                        value={product.total}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addProductRow}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Add Another Product</span>
                </button>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FaBars className="text-blue-600" />
                <h2 className="text-xl font-bold">Payment Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtotal
                  </label>
                  <input
                    type="number"
                    value={subtotal.toFixed(2)}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paymentInfo.discount}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, discount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paymentInfo.tax}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, tax: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentInfo.method}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Payment (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    value={paymentInfo.initialPayment}
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      const status = amount >= totalAmount ? 'Fully Paid' :
                                    amount > 0 ? 'Partially Paid' : 'Unpaid';
                      setPaymentInfo({ ...paymentInfo, initialPayment: amount, paymentStatus: status });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter initial payment amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave 0 for unpaid, or enter partial/full payment amount
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={totalAmount.toFixed(2)}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.initialPayment >= totalAmount ? 'Fully Paid' :
                          paymentInfo.initialPayment > 0 ? 'Partially Paid' : 'Unpaid'}
                    readOnly
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 ${
                      paymentInfo.initialPayment >= totalAmount ? 'text-green-600' :
                      paymentInfo.initialPayment > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}
                  />
                </div>
                {paymentInfo.initialPayment < totalAmount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remaining Amount
                    </label>
                    <input
                      type="number"
                      value={(totalAmount - paymentInfo.initialPayment).toFixed(2)}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-red-50 text-red-600 font-semibold"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleSave}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
              >
                <FaSave />
                <span>Save Sale</span>
              </button>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Sale Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Sale Summary</h2>
              <div className="space-y-2 text-sm">
                <div>Customer: {customerInfo.name || 'Not entered'}</div>
                <div>Products: {products.filter((p) => p.productId).length} items</div>
                <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
                <div>Discount: ₹{paymentInfo.discount.toFixed(2)}</div>
                <div>Tax: ₹{paymentInfo.tax.toFixed(2)}</div>
                <hr className="my-3" />
                <div className="text-lg font-bold text-blue-600">
                  Total Amount: ₹{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Available Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Available Products</h2>
              <div className="space-y-3">
                {availableProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-md p-3">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{product.description}</div>
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm inline-block">
                      ₹{product.price}/{product.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
