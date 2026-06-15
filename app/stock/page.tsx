'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaWarehouse, FaSearch, FaPlus, FaDownload, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import { store, type StockItem, type StockLog } from '@/lib/store';

export default function StockPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState('all');
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  // Pagination & Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockItem, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItemHistory, setSelectedItemHistory] = useState<StockLog[]>([]);
  const [selectedItemName, setSelectedItemName] = useState('');

  useEffect(() => {
    setStockItems(store.getStockItems());
  }, []);

  const monthYearFilteredItems = stockItems.filter((item) => {
    const itemDateRaw = item.date || item.createdAt.split('T')[0];
    const itemDate = new Date(itemDateRaw);
    if (Number.isNaN(itemDate.getTime())) return false;
    
    if (itemDate.getMonth() + 1 !== currentMonth || itemDate.getFullYear() !== currentYear) {
      return false;
    }

    const day = itemDate.getDate();
    if (period === '1-10' && (day < 1 || day > 10)) return false;
    if (period === '11-20' && (day < 11 || day > 20)) return false;
    if (period === '21-end' && day < 21) return false;

    return true;
  });

  const filteredItems = monthYearFilteredItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = (key: keyof StockItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let aValue: any = a[key];
    let bValue: any = b[key];

    // Special handling for date
    if (key === 'date') {
      aValue = a.date || a.createdAt;
      bValue = b.date || b.createdAt;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig, currentMonth, currentYear, period]);

  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(sortedItems.length / rowsPerPage);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <FaSort className="ml-2 opacity-40" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="ml-2" /> : <FaSortDown className="ml-2" />;
  };

  const totalStockQuantity = filteredItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const handleEdit = (id: string) => {
    router.push(`/stock/add?edit=${id}`);
  };

  const handleDelete = (item: StockItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      store.deleteStockItem(itemToDelete.id);
      setStockItems(store.getStockItems());
      setItemToDelete(null);
    }
  };

  const handleViewHistory = (item: StockItem) => {
    setSelectedItemName(item.itemName);
    setSelectedItemHistory(store.getStockLogs(item.id));
    setShowHistoryModal(true);
  };

  const handleExportCSV = () => {
    const headers = ['Item Name', 'Quantity', 'Unit', 'Date', 'Description'];
    const rows = sortedItems.map(item => [
      item.itemName,
      item.quantity.toString(),
      item.unit,
      item.date || item.createdAt.split('T')[0],
      item.description,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <FaWarehouse className="text-3xl text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold">Stock Management</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/stock/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <FaPlus />
                <span>Add Stock Item</span>
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

          {/* Month/Year/Period Selector */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
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
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Period:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Entire Month</option>
                <option value="1-10">1st to 10th</option>
                <option value="11-20">11th to 20th</option>
                <option value="21-end">21st to End of Month</option>
              </select>
            </div>
          </div>

          {/* Search Bar & Total */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stock items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-100 flex items-center space-x-2">
              <span className="text-sm text-blue-600 font-medium">Total Quantity:</span>
              <span className="text-xl font-bold text-blue-800">{totalStockQuantity}</span>
            </div>
          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto mb-6 bg-white border border-gray-200 rounded-lg">
            <table className="w-full min-w-[800px] text-sm sm:text-base">
              <thead>
                <tr className="bg-blue-600 text-white border-b border-blue-700">
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('itemName')}>
                    <div className="flex items-center">Item Name <SortIcon columnKey="itemName" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('quantity')}>
                    <div className="flex items-center">Quantity <SortIcon columnKey="quantity" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('unit')}>
                    <div className="flex items-center">Unit <SortIcon columnKey="unit" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none hidden sm:table-cell" onClick={() => handleSort('date')}>
                    <div className="flex items-center">Date <SortIcon columnKey="date" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none hidden md:table-cell" onClick={() => handleSort('description')}>
                    <div className="flex items-center">Description <SortIcon columnKey="description" /></div>
                  </th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                        <FaWarehouse className="text-4xl opacity-20" />
                        <p className="text-lg font-medium text-gray-700">No stock items found.</p>
                        <p className="text-sm">Click "Add Stock Item" to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const threshold = item.lowStockThreshold || 10;
                    const isLowStock = item.quantity <= threshold;
                    const isMediumStock = item.quantity > threshold && item.quantity <= threshold * 1.5;
                    const rowBgClass = isLowStock 
                      ? 'bg-red-50 hover:bg-red-100' 
                      : isMediumStock 
                        ? 'bg-orange-50 hover:bg-orange-100' 
                        : 'hover:bg-blue-50';

                    return (
                      <tr key={item.id} className={`border-b transition-colors ${rowBgClass}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.itemName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${isLowStock ? 'text-red-700' : ''}`}>{item.quantity}</span>
                            {isLowStock && <FaExclamationTriangle className="text-red-500" title={`Low Stock Alert (Threshold: ${threshold})`} />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.unit}</td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.date || item.createdAt.split('T')[0]}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{item.description || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewHistory(item)}
                              className="bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 transition-colors"
                              title="View History"
                            >
                              <FaHistory />
                            </button>
                            <button
                              onClick={() => handleEdit(item.id)}
                              className="bg-yellow-100 text-yellow-700 p-2 rounded hover:bg-yellow-200 transition-colors"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                    Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, sortedItems.length)}</span> of{' '}
                    <span className="font-medium">{sortedItems.length}</span> results
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">History: {selectedItemName}</h2>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedItemHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaHistory className="text-4xl mx-auto mb-3 opacity-20" />
                  <p>No history available for this item.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedItemHistory.map((log) => {
                    const isAddition = log.quantityChange > 0;
                    const isReduction = log.quantityChange < 0;
                    return (
                      <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <div className="text-sm text-gray-500">{new Date(log.date).toLocaleString()}</div>
                          <div className="font-medium text-gray-800 mt-1">{log.reason}</div>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Change</div>
                            <div className={`font-bold ${isAddition ? 'text-green-600' : isReduction ? 'text-red-600' : 'text-gray-600'}`}>
                              {isAddition ? '+' : ''}{log.quantityChange}
                            </div>
                          </div>
                          <div className="text-right border-l pl-4 border-gray-300">
                            <div className="text-xs text-gray-500">New Quantity</div>
                            <div className="font-bold text-gray-900">{log.newQuantity}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>{itemToDelete.itemName}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
