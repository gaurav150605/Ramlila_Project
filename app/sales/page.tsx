'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaShoppingCart, FaSearch, FaPlus, FaDownload, FaFileAlt, FaRupeeSign } from 'react-icons/fa';
import { store, type Sale } from '@/lib/store';
import InvoiceModal from '@/components/InvoiceModal';
import PaymentModal from '@/components/PaymentModal';

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    setSales(store.getSales());
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer.phone?.includes(searchQuery) ||
      sale.products.some(p => p.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExportCSV = () => {
    const headers = ['Date', 'Customer', 'Phone', 'Products', 'Total', 'Paid', 'Remaining', 'Payment Status', 'Payment Method'];
    const rows = sales.map(sale => [
      sale.date,
      sale.customer.name,
      sale.customer.phone || '',
      sale.products.map(p => `${p.productName} (${p.quantity})`).join('; '),
      sale.total.toString(),
      sale.paidAmount.toString(),
      sale.remainingAmount.toString(),
      sale.paymentStatus,
      sale.paymentMethod,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSaleDetails = (sale: Sale) => {
    if (sale.products.length === 0) return '';
    const firstProduct = sale.products[0];
    const remaining = sale.products.length - 1;
    if (remaining === 0) {
      return `${firstProduct.productName} (${sale.products.length} item)`;
    }
    return `${firstProduct.productName} + ${remaining} more (${sale.products.length} items)`;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Fully Paid':
        return 'bg-green-100 text-green-700';
      case 'Partially Paid':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FaShoppingCart className="text-3xl text-blue-600" />
              <h1 className="text-3xl font-bold">Sales Management</h1>
            </div>
            <div className="flex flex-col space-y-2">
              <Link
                href="/sales/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>+ Add Sale</span>
              </Link>
              <button
                onClick={handleExportCSV}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
              >
                <FaDownload />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Details</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Paid</th>
                  <th className="px-4 py-3 text-left">Remaining</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No sales found. Add your first sale to get started.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{sale.date}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{sale.customer.name}</div>
                          {sale.customer.phone && (
                            <div className="text-sm text-gray-500">{sale.customer.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{formatSaleDetails(sale)}</td>
                      <td className="px-4 py-3 font-semibold">₹{(sale.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">₹{(sale.paidAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">₹{(sale.remainingAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-sm ${getPaymentStatusColor(sale.paymentStatus || 'Unpaid')}`}>
                          {sale.paymentStatus || 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors flex items-center space-x-1"
                            title="View Invoice"
                          >
                            <FaFileAlt />
                            <span>Bill</span>
                          </button>
                          {(sale.remainingAmount || sale.total || 0) > 0 && (
                            <button
                              onClick={() => setSelectedSaleForPayment(sale)}
                              className="bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors flex items-center space-x-1"
                              title="Add Payment"
                            >
                              <FaRupeeSign />
                              <span>Pay</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />

      {/* Invoice Modal */}
      {selectedSale && (
        <InvoiceModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}

      {/* Payment Modal */}
      {selectedSaleForPayment && (
        <PaymentModal
          sale={selectedSaleForPayment}
          onClose={() => setSelectedSaleForPayment(null)}
          onUpdate={loadSales}
        />
      )}
    </div>
  );
}
