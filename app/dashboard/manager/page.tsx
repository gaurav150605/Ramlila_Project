'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaShoppingCart, FaWarehouse, FaCookie, FaChartBar, FaUsers, FaBriefcase } from 'react-icons/fa';
import { authService } from '@/lib/auth';
import { store } from '@/lib/store';

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'Manager') {
      // Redirect to appropriate dashboard based on role
      router.push(authService.getRoleBasedRedirect(currentUser.role));
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return null; // Loading or redirecting
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto flex items-center space-x-6">
          <div className="text-6xl">🍬</div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <FaBriefcase className="text-3xl text-blue-200" />
              <h1 className="text-4xl font-bold">Manager Dashboard</h1>
            </div>
            <p className="text-xl mb-4">Ramlila Pedhewale-Bidkar Management System</p>
            <p className="text-blue-100">
              Welcome, <span className="font-semibold">{user.fullName}</span>! Manage operations, sales, and team activities.
            </p>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sales Management Card */}
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
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>→ Manage Sales</span>
            </Link>
          </div>

          {/* Stock Management Card */}
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
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <span>→ Manage Stock</span>
            </Link>
          </div>

          {/* Product Management Card */}
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
              className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              <span>→ Manage Products</span>
            </Link>
          </div>

          {/* Reports & Analytics Card */}
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
              className="inline-flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
            >
              <span>→ View Reports</span>
            </Link>
          </div>

          {/* Employee Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <FaUsers className="text-3xl text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Employee Management</h2>
            <p className="text-gray-600 mb-4">
              View and manage employee information and attendance.
            </p>
            <Link
              href="/employees"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <span>→ Manage Employees</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

