'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCookie, FaSearch, FaPlus, FaDownload, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { store, type Product } from '@/lib/store';

export default function ProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Pagination & Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  useEffect(() => {
    setProducts(store.getProducts());
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aValue = a[key] ?? '';
    const bValue = b[key] ?? '';
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Reset to page 1 if searching/sorting changes and we have fewer items
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(sortedProducts.length / rowsPerPage);

  const hasDescription = products.some(p => p.description && p.description.trim() !== '');
  const hasCreated = products.some(p => p.created && p.created.trim() !== '');

  const SortIcon = ({ columnKey }: { columnKey: keyof Product }) => {
    if (sortConfig?.key !== columnKey) return <FaSort className="ml-2 opacity-40" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="ml-2" /> : <FaSortDown className="ml-2" />;
  };

  const handleEdit = (id: string) => {
    router.push(`/products/add?edit=${id}`);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      store.deleteProduct(productToDelete.id);
      setProducts(store.getProducts());
      setProductToDelete(null);
    }
  };

  const totalProducts = products.length;
  const averagePrice = products.length > 0
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length
    : 0;
  const prices = products.map((p) => p.price);
  const priceRange = prices.length > 0
    ? `₹${Math.min(...prices)} - ₹${Math.max(...prices)}`
    : '₹0 - ₹0';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <FaCookie className="text-3xl text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold">Product Management</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <FaPlus />
                <span>Add Product</span>
              </Link>
              <button className="bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center space-x-2 border border-gray-300 text-sm sm:text-base">
                <FaDownload />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto mb-6 bg-white border border-gray-200 rounded-lg">
            <table className="w-full min-w-[600px] text-sm sm:text-base">
              <thead>
                <tr className="bg-blue-600 text-white border-b border-blue-700">
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 transition-colors select-none" onClick={() => handleSort('name')}>
                    <div className="flex items-center">Product Name <SortIcon columnKey="name" /></div>
                  </th>
                  {hasDescription && (
                    <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 transition-colors select-none hidden sm:table-cell" onClick={() => handleSort('description')}>
                      <div className="flex items-center">Description <SortIcon columnKey="description" /></div>
                    </th>
                  )}
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 transition-colors select-none" onClick={() => handleSort('price')}>
                    <div className="flex items-center">Price <SortIcon columnKey="price" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 transition-colors select-none" onClick={() => handleSort('unit')}>
                    <div className="flex items-center">Unit <SortIcon columnKey="unit" /></div>
                  </th>
                  {hasCreated && (
                    <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 transition-colors select-none hidden md:table-cell" onClick={() => handleSort('created')}>
                      <div className="flex items-center">Created <SortIcon columnKey="created" /></div>
                    </th>
                  )}
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                        <FaCookie className="text-4xl opacity-20" />
                        <p className="text-lg font-medium text-gray-700">No products found.</p>
                        <p className="text-sm">Click "Add Product" to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                      {hasDescription && <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{product.description}</td>}
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{product.unit}</td>
                      {hasCreated && <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{product.created || '-'}</td>}
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="bg-yellow-100 text-yellow-700 p-2 rounded hover:bg-yellow-200 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
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
            <div className="flex items-center justify-between px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg mb-6">
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
                    Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, sortedProducts.length)}</span> of{' '}
                    <span className="font-medium">{sortedProducts.length}</span> results
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
                      // Show limited page numbers if there are too many pages
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-blue-500 text-white rounded-lg p-6 shadow-sm">
              <div className="text-sm mb-2 opacity-90">Total Products</div>
              <div className="text-3xl sm:text-4xl font-bold">{totalProducts}</div>
            </div>
            <div className="bg-green-500 text-white rounded-lg p-6 shadow-sm">
              <div className="text-sm mb-2 opacity-90">Average Price</div>
              <div className="text-3xl sm:text-4xl font-bold">₹{Math.round(averagePrice).toLocaleString()}</div>
            </div>
            <div className="bg-cyan-500 text-white rounded-lg p-6 shadow-sm">
              <div className="text-sm mb-2 opacity-90">Price Range</div>
              <div className="text-3xl sm:text-4xl font-bold">{priceRange}</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setProductToDelete(null)}
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
