'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaChartBar, FaPrint, FaDownload, FaRupeeSign, FaWeight, FaShoppingCart, FaCookie, FaChartPie, FaWarehouse, FaHistory } from 'react-icons/fa';
import { store } from '@/lib/store';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const [sales, setSales] = useState(store.getSales());
  const [products, setProducts] = useState(store.getProducts());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setSales(store.getSales());
    setProducts(store.getProducts());
  }, []);

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    if (Number.isNaN(saleDate.getTime())) return false;
    return saleDate.getMonth() + 1 === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalPaid = filteredSales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
  const totalPending = filteredSales.reduce((sum, sale) => sum + (sale.remainingAmount || 0), 0);
  const totalQuantity = filteredSales.reduce((sum, sale) => 
    sum + sale.products.reduce((pSum, p) => pSum + p.quantity, 0), 0
  );
  const totalOrders = filteredSales.length;

  // Top Sellers Aggregation
  const salesByProduct: Record<string, { quantity: number; revenue: number }> = {};
  filteredSales.forEach(sale => {
    sale.products.forEach(product => {
      if (!salesByProduct[product.productName]) {
        salesByProduct[product.productName] = { quantity: 0, revenue: 0 };
      }
      salesByProduct[product.productName].quantity += product.quantity;
      salesByProduct[product.productName].revenue += product.total;
    });
  });

  // Customers List Aggregation
  const customersList: Record<string, { orders: number; spent: number }> = {};
  filteredSales.forEach(sale => {
    if (!customersList[sale.customer.name]) {
      customersList[sale.customer.name] = { orders: 0, spent: 0 };
    }
    customersList[sale.customer.name].orders += 1;
    customersList[sale.customer.name].spent += sale.total;
  });

  // ================= CHART DATA PREPARATION =================

  // 1. Daily Sales Trends (Bar)
  const dailySalesMap: Record<string, number> = {};
  const dailyPaidMap: Record<string, number> = {};
  const dailyPendingMap: Record<string, number> = {};

  filteredSales.forEach(sale => {
    const day = new Date(sale.date).getDate().toString();
    dailySalesMap[day] = (dailySalesMap[day] || 0) + sale.total;
    dailyPaidMap[day] = (dailyPaidMap[day] || 0) + (sale.paidAmount || 0);
    dailyPendingMap[day] = (dailyPendingMap[day] || 0) + (sale.remainingAmount || 0);
  });

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const labelsDaily = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  
  const dataDaily = labelsDaily.map(day => dailySalesMap[day] || 0);
  const dataPaid = labelsDaily.map(day => dailyPaidMap[day] || 0);
  const dataPending = labelsDaily.map(day => dailyPendingMap[day] || 0);

  const barChartData = {
    labels: labelsDaily,
    datasets: [
      {
        label: 'Daily Revenue (₹)',
        data: dataDaily,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const lineChartData = {
    labels: labelsDaily,
    datasets: [
      {
        label: 'Paid Amount (₹)',
        data: dataPaid,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Pending Amount (₹)',
        data: dataPending,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: { y: { beginAtZero: true } }
  };

  // 2. Top Products Doughnut
  const productLabels = Object.keys(salesByProduct).sort((a, b) => salesByProduct[b].revenue - salesByProduct[a].revenue).slice(0, 5);
  const productRevenues = productLabels.map(p => salesByProduct[p].revenue);

  const doughnutChartData = {
    labels: productLabels.length > 0 ? productLabels : ['No Data'],
    datasets: [
      {
        data: productRevenues.length > 0 ? productRevenues : [1],
        backgroundColor: productRevenues.length > 0 ? [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ] : ['rgba(209, 213, 219, 0.8)'],
        borderWidth: 1,
      },
    ],
  };

  // ================= END CHART DATA =================

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
      topSellers: salesByProduct,
      customersList,
      recentSales: filteredSales.slice(0, 10),
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <FaChartBar className="text-3xl text-blue-600" />
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Month:</label>
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' }) }
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
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPrint />
                <span className="hidden md:inline">Print Report</span>
              </button>
              <button
                onClick={handleExportData}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
              >
                <FaDownload />
                <span className="hidden md:inline">Export Data</span>
              </button>
            </div>
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FaRupeeSign className="text-2xl text-green-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FaRupeeSign className="text-2xl text-red-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Total Pending</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPending)}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FaRupeeSign className="text-2xl text-blue-600" />
            </div>
            <div className="text-sm text-gray-600 mb-1">Payment Collection Rate</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Daily Sales Trend</h2>
            <div className="h-72">
              <Bar data={barChartData} options={commonChartOptions} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Payment Collection Over Time</h2>
            <div className="h-72">
              <Line data={lineChartData} options={commonChartOptions} />
            </div>
          </div>
        </div>

        {/* Data Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Sellers Doughnut */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Revenue by Product</h2>
            <div className="h-64 flex justify-center">
              <Doughnut 
                data={doughnutChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } } 
                }} 
              />
            </div>
          </div>

          {/* Top Sellers List */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <FaChartPie className="text-blue-600" />
              <h2 className="text-xl font-bold">Top Sellers</h2>
            </div>
            {Object.keys(salesByProduct).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaChartPie className="text-6xl mb-4" />
                <p>No sales data available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
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

          {/* Customers List */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <FaShoppingCart className="text-blue-600" />
              <h2 className="text-xl font-bold">Customers List</h2>
            </div>
            {Object.keys(customersList).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FaShoppingCart className="text-6xl mb-4" />
                <p>No customer data available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {Object.entries(customersList)
                  .sort((a, b) => b[1].spent - a[1].spent)
                  .map(([customer, data]) => (
                    <div key={customer} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{customer}</span>
                        <span className="text-green-600 font-bold">{formatCurrency(data.spent)}</span>
                      </div>
                      <div className="text-sm text-gray-600">Total Orders: {data.orders}</div>
                    </div>
                  ))}
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
          {filteredSales.length === 0 ? (
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
                  {filteredSales.slice(0, 10).map((sale) => (
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
