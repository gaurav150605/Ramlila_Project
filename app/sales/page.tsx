'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaShoppingCart, FaSearch, FaPlus, FaDownload, FaFileAlt, FaRupeeSign, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { store, type Sale } from '@/lib/store';
import InvoiceModal from '@/components/InvoiceModal';
import PaymentModal from '@/components/PaymentModal';

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);

  // Pagination & Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    setSales(store.getSales());
  };

  const monthYearFilteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    if (Number.isNaN(saleDate.getTime())) return false;
    return (
      saleDate.getMonth() + 1 === currentMonth &&
      saleDate.getFullYear() === currentYear
    );
  });

  const filteredSales = monthYearFilteredSales.filter(
    (sale) =>
      sale.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer.phone?.includes(searchQuery) ||
      sale.products.some(p => p.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: any = a[key as keyof Sale];
    let bValue: any = b[key as keyof Sale];

    // Special handling for nested or calculated fields
    if (key === 'customer') {
      aValue = a.customer.name;
      bValue = b.customer.name;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig, currentMonth, currentYear]);

  const paginatedSales = sortedSales.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(sortedSales.length / rowsPerPage);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <FaSort className="ml-2 opacity-40" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="ml-2" /> : <FaSortDown className="ml-2" />;
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Customer', 'Phone', 'Products', 'Total', 'Paid', 'Remaining', 'Payment Status', 'Payment Method'];
    const rows = sortedSales.map(sale => [
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <FaShoppingCart className="text-3xl text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold">Sales Management</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/sales/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <FaPlus />
                <span>Add Sale</span>
              </Link>
              <button
                onClick={handleExportCSV}
                className="bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center space-x-2 border border-gray-300 text-sm sm:text-base"
              >
                <FaDownload />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Month/Year Selector & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Month:</label>
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Year:</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="relative w-full md:w-64">
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
          <div className="overflow-x-auto mb-6 bg-white border border-gray-200 rounded-lg">
            <table className="w-full min-w-[900px] text-sm sm:text-base">
              <thead>
                <tr className="bg-blue-600 text-white border-b border-blue-700">
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('date')}>
                    <div className="flex items-center">Date <SortIcon columnKey="date" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('customer')}>
                    <div className="flex items-center">Customer <SortIcon columnKey="customer" /></div>
                  </th>
                  <th className="px-4 py-3 text-left">Details</th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('total')}>
                    <div className="flex items-center">Total <SortIcon columnKey="total" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none hidden sm:table-cell" onClick={() => handleSort('paidAmount')}>
                    <div className="flex items-center">Paid <SortIcon columnKey="paidAmount" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('remainingAmount')}>
                    <div className="flex items-center">Remaining <SortIcon columnKey="remainingAmount" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none hidden lg:table-cell" onClick={() => handleSort('paymentStatus')}>
                    <div className="flex items-center">Status <SortIcon columnKey="paymentStatus" /></div>
                  </th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                        <FaShoppingCart className="text-4xl opacity-20" />
                        <p className="text-lg font-medium text-gray-700">No sales found.</p>
                        <p className="text-sm">Click "Add Sale" to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">{sale.date}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{sale.customer.name}</div>
                          {sale.customer.phone && (
                            <div className="text-sm text-gray-500">{sale.customer.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatSaleDetails(sale)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">₹{(sale.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-600 font-medium hidden sm:table-cell">₹{(sale.paidAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">₹{(sale.remainingAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPaymentStatusColor(sale.paymentStatus || 'Unpaid')}`}>
                          {sale.paymentStatus || 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                            title="View Invoice"
                          >
                            <FaFileAlt />
                            <span className="text-xs font-medium">Bill</span>
                          </button>
                          {(sale.remainingAmount || sale.total || 0) > 0 && (
                            <button
                              onClick={() => setSelectedSaleForPayment(sale)}
                              className="bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors flex items-center space-x-1"
                              title="Add Payment"
                            >
                              <FaRupeeSign />
                              <span className="text-xs font-medium">Pay</span>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, sortedSales.length)}</span> of{' '}
                    <span className="font-medium">{sortedSales.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      if (totalPages > 7 && i > 1 && i < totalPages - 2 && Math.abs(currentPage - 1 - i) > 1) {
                        if (i === 2 || i === totalPages - 3) return <span key={i} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                        return null;
                      }
                      return (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
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
