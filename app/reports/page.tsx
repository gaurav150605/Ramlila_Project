'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaChartBar, FaPrint, FaDownload, FaRupeeSign, FaWeight, FaShoppingCart, FaCookie, FaChartPie, FaWarehouse, FaHistory } from 'react-icons/fa';
import { store } from '@/lib/store';

export default function ReportsPage() {
  const [sales, setSales] = useState(store.getSales());
  const [stockItems, setStockItems] = useState(store.getStockItems());
  const [products, setProducts] = useState(store.getProducts());

  useEffect(() => {
    setSales(store.getSales());
    setStockItems(store.getStockItems());
    setProducts(store.getProducts());
  }, []);

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalPaid = sales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
  const totalPending = sales.reduce((sum, sale) => sum + (sale.remainingAmount || 0), 0);
  const totalQuantity = sales.reduce((sum, sale) => 
    sum + sale.products.reduce((pSum, p) => pSum + p.quantity, 0), 0
  );
  const totalOrders = sales.length;

  // Sales by Product
  const salesByProduct: Record<string, { quantity: number; revenue: number }> = {};
  sales.forEach(sale => {
    sale.products.forEach(product => {
      if (!salesByProduct[product.productName]) {
        salesByProduct[product.productName] = { quantity: 0, revenue: 0 };
      }
      salesByProduct[product.productName].quantity += product.quantity;
      salesByProduct[product.productName].revenue += product.total;
    });
  });

  // Stock Status
  const stockStatus = {
    low: stockItems.filter(item => item.quantity < 10).length,
    medium: stockItems.filter(item => item.quantity >= 10 && item.quantity <= 50).length,
    good: stockItems.filter(item => item.quantity > 50).length,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportData = () => {
    const data = {
      summary: {
        totalSales,
        totalPaid,
        totalPending,
        totalQuantity,
        totalOrders,
        totalProducts: products.length,
      },
      salesByProduct,
      stockStatus,
      recentSales: sales.slice(0, 10),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaChartBar className="text-3xl text-blue-600" />
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaPrint />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportData}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <FaDownload />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-500 text-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <FaRupeeSign className="text-3xl opacity-80" />
            </div>
            <div className="text-sm mb-1 opacity-90">Total Sales</div>
            <div className="text-3xl font-bold">{formatCurrency(totalSales)}</div>
          </div>
          <div className="bg-green-500 text-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <FaWeight className="text-3xl opacity-80" />
            </div>
            <div className="text-sm mb-1 opacity-90">Total Quantity</div>
            <div className="text-3xl font-bold">{totalQuantity.toLocaleString()} kg</div>
          </div>
          <div className="bg-cyan-500 text-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <FaShoppingCart className="text-3xl opacity-80" />
            </div>
            <div className="text-sm mb-1 opacity-90">Total Orders</div>
            <div className="text-3xl font-bold">{totalOrders.toLocaleString()}</div>
          </div>
          <div className="bg-yellow-500 text-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <FaCookie className="text-3xl opacity-80" />
            </div>
            <div className="text-sm mb-1 opacity-90">Products</div>
            <div className="text-3xl font-bold">{products.length.toLocaleString()}</div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <FaRupeeSign className="text-2xl text-green-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <FaRupeeSign className="text-2xl text-red-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Pending</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPending)}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <FaRupeeSign className="text-2xl text-blue-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Payment Collection Rate</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Data Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Sales by Product */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FaChartPie className="text-blue-600" />
              <h2 className="text-xl font-bold">Sales by Product</h2>
            </div>
            {Object.keys(salesByProduct).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaChartPie className="text-6xl mb-4" />
                <p>No sales data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(salesByProduct)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .map(([product, data]) => (
                    <div key={product} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{product}</span>
                        <span className="text-blue-600 font-bold">{formatCurrency(data.revenue)}</span>
                      </div>
                      <div className="text-sm text-gray-600">Quantity: {data.quantity.toLocaleString()} kg</div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FaWarehouse className="text-blue-600" />
              <h2 className="text-xl font-bold">Stock Status</h2>
            </div>
            {stockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaWarehouse className="text-6xl mb-4" />
                <p>No stock data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200">
                  <span className="font-semibold text-red-700">Low Stock</span>
                  <span className="text-red-600 font-bold text-lg">{stockStatus.low.toLocaleString()} items</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <span className="font-semibold text-yellow-700">Medium Stock</span>
                  <span className="text-yellow-600 font-bold text-lg">{stockStatus.medium.toLocaleString()} items</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                  <span className="font-semibold text-green-700">Good Stock</span>
                  <span className="text-green-600 font-bold text-lg">{stockStatus.good.toLocaleString()} items</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaHistory className="text-blue-600" />
            <h2 className="text-xl font-bold">Recent Sales</h2>
          </div>
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FaShoppingCart className="text-6xl mb-4" />
              <p>No sales data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Products</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-right">Paid</th>
                    <th className="px-4 py-2 text-right">Remaining</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 10).map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{sale.date}</td>
                      <td className="px-4 py-2 font-medium">{sale.customer.name}</td>
                      <td className="px-4 py-2 text-gray-600">
                        {sale.products.map(p => p.productName).join(', ')}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">{formatCurrency(sale.total || 0)}</td>
                      <td className="px-4 py-2 text-right text-green-600 font-semibold">{formatCurrency(sale.paidAmount || 0)}</td>
                      <td className="px-4 py-2 text-right text-red-600 font-semibold">{formatCurrency(sale.remainingAmount || 0)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          (sale.paymentStatus || 'Unpaid') === 'Fully Paid' ? 'bg-green-100 text-green-700' :
                          (sale.paymentStatus || 'Unpaid') === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {sale.paymentStatus || 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

