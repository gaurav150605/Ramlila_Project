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
  });

  useEffect(() => {
    setAvailableProducts(store.getProducts());
  }, []);

  /* ================= PRODUCT UPDATE ================= */

  const updateProduct = (
    index: number,
    field: keyof ProductRow,
    value: string | number
  ) => {
    const updatedProducts = [...products];
    const row = { ...updatedProducts[index] };

    if (field === 'productId') {
      const product = availableProducts.find((p) => p.id === value);
      if (product) {
        row.productId = product.id;
        row.price = product.price;
        row.total = row.quantity * product.price;
      } else {
        row.productId = '';
        row.price = 0;
        row.total = 0;
      }
    }

    if (field === 'quantity') {
      const qty = Number(value);
      row.quantity = Number.isNaN(qty) ? 0 : qty;
      row.total = row.quantity * row.price;
    }

    updatedProducts[index] = row;
    setProducts(updatedProducts);
  };

  const addProductRow = () => {
    setProducts([
      ...products,
      { productId: '', quantity: 0, price: 0, total: 0 },
    ]);
  };

  /* ================= CALCULATIONS ================= */

  const subtotal = products.reduce((sum, p) => sum + (p.total || 0), 0);

  const discount = Math.max(0, Number(paymentInfo.discount) || 0);
  const tax = Math.max(0, Number(paymentInfo.tax) || 0);

  const totalAmount = Math.max(0, subtotal - discount + tax);

  const paymentStatus: 'Fully Paid' | 'Partially Paid' | 'Unpaid' =
  paymentInfo.initialPayment >= totalAmount
    ? 'Fully Paid'
    : paymentInfo.initialPayment > 0
    ? 'Partially Paid'
    : 'Unpaid';

  /* ================= SAVE SALE ================= */

  const handleSave = () => {
    const customerName = customerInfo.name.trim();

    if (!customerName) {
      alert('Please enter customer name');
      return;
    }

    const validProducts = products.filter(
      (p) => p.productId && p.quantity > 0
    );

    if (validProducts.length === 0) {
      alert('Please add at least one valid product');
      return;
    }

    const safeInitialPayment = Math.min(
      Number(paymentInfo.initialPayment) || 0,
      totalAmount
    );

    const sale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      customer: {
        name: customerName,
        phone: customerInfo.phone.trim(),
        address: customerInfo.address.trim() || undefined,
      },
      products: validProducts.map((p) => {
        const product = availableProducts.find(
          (ap) => ap.id === p.productId
        );

        return {
          productId: p.productId,
          productName: product?.name ?? '',
          quantity: p.quantity,
          price: p.price,
          total: p.total,
        };
      }),
      subtotal,
      discount,
      tax,
      total: totalAmount,
      paymentMethod: paymentInfo.method,
      paymentStatus,
      paidAmount: safeInitialPayment,
      remainingAmount: totalAmount - safeInitialPayment,
      payments:
        safeInitialPayment > 0
          ? [
              {
                id: crypto.randomUUID(),
                date: new Date().toISOString().split('T')[0],
                amount: safeInitialPayment,
                paymentMethod: paymentInfo.method,
                notes: 'Initial payment',
              },
            ]
          : [],
    };

    store.addSale(sale);
    router.push('/sales');
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            Add New Sale (Multiple Products)
          </h1>
          <Link
            href="/sales"
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back to Sales</span>
          </Link>
        </div>

        {/* SAVE BUTTON */}
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

      <Footer />
    </div>
  );
}
