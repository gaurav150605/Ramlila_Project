'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  FaShoppingCart, 
  FaWarehouse, 
  FaCookie, 
  FaChartBar 
} from 'react-icons/fa';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Optional: If you REALLY want role-based redirect, uncomment below
    // const redirectPath = authService.getRoleBasedRedirect(currentUser.role);
    // router.push(redirectPath);

  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Banner Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto flex items-center space-x-6">
          <div className="text-6xl">🍬</div>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Ramlila Pedhewale-Bidkar
            </h1>
            <p className="text-xl mb-4">
              Traditional Sweet Manufacturing & Management System
            </p>
            <p className="text-blue-100">
              Welcome to the comprehensive factory management system for 
              Ramlila Pedhewale. Manage your sales, inventory, products, 
              and generate reports all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Sales */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FaShoppingCart className="text-3xl text-blue-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sales Management</h2>
            <p className="text-gray-600 mb-4">
              Manage customer orders, track sales, and generate invoices.
            </p>
            <Link
              href="/sales"
              className="inline-flex bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              → Manage Sales
            </Link>
          </div>

          {/* Stock */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FaWarehouse className="text-3xl text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Stock Management</h2>
            <p className="text-gray-600 mb-4">
              Track inventory levels of raw materials like sugar and milk.
            </p>
            <Link
              href="/stock"
              className="inline-flex bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              → Manage Stock
            </Link>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <FaCookie className="text-3xl text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Product Management</h2>
            <p className="text-gray-600 mb-4">
              Add, edit, and manage your pedha product catalog.
            </p>
            <Link
              href="/products"
              className="inline-flex bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              → Manage Products
            </Link>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
              <FaChartBar className="text-3xl text-cyan-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Reports & Analytics</h2>
            <p className="text-gray-600 mb-4">
              View sales reports, analytics, and business insights.
            </p>
            <Link
              href="/reports"
              className="inline-flex bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
            >
              → View Reports
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}