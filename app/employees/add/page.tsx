'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaPlus, FaArrowLeft, FaInfoCircle, FaLightbulb, FaSave, FaCalendarAlt } from 'react-icons/fa';
import { store } from '@/lib/store';

export default function AddEmployeePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    joiningDate: new Date().toISOString().split('T')[0],
    role: '',
    basicSalary: '',
    address: '',
  });

  useEffect(() => {
    if (isEdit && editId) {
      const employee = store.getEmployee(editId);
      if (employee) {
        // Parse the joining date from format like "Dec 05, 2025"
        const dateParts = employee.joiningDate.split(' ');
        const monthMap: Record<string, string> = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        let dateStr = employee.joiningDate;
        if (dateParts.length === 3) {
          const month = monthMap[dateParts[0]] || '01';
          const day = dateParts[1].replace(',', '').padStart(2, '0');
          const year = dateParts[2];
          dateStr = `${year}-${month}-${day}`;
        }
        
        setFormData({
          fullName: employee.name,
          phoneNumber: employee.contact,
          joiningDate: dateStr,
          role: employee.role,
          basicSalary: employee.salary.toString(),
          address: employee.address || '',
        });
      }
    }
  }, [isEdit, editId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.joiningDate || !formData.role || !formData.basicSalary) {
      alert('Please fill in all required fields');
      return;
    }

    const joiningDateFormatted = new Date(formData.joiningDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });

    if (isEdit && editId) {
      store.updateEmployee(editId, {
        name: formData.fullName,
        contact: formData.phoneNumber,
        role: formData.role,
        joiningDate: joiningDateFormatted,
        salary: Number(formData.basicSalary),
        address: formData.address || undefined,
      });
    } else {
      const employee = {
        id: Date.now().toString(),
        name: formData.fullName,
        contact: formData.phoneNumber,
        role: formData.role,
        joiningDate: joiningDateFormatted,
        salary: Number(formData.basicSalary),
        status: 'Active' as const,
        address: formData.address || undefined,
      };
      store.addEmployee(employee);
    }
    router.push('/employees');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaPlus className="text-2xl" />
            <h1 className="text-3xl font-bold">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
          </div>
          <Link
            href="/employees"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>← Back to Employees</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Employee Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joining Date *
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role/Position *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    <option value="Manager">Manager</option>
                    <option value="Production">Production</option>
                    <option value="Quality">Quality</option>
                    <option value="Sales">Sales</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Worker">Worker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Basic Salary (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gray-100 px-2 py-1 border-r border-gray-300">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                      className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={4}
                    placeholder="Employee address..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push('/employees')}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaSave />
                    <span>{isEdit ? 'Update Employee' : 'Save Employee'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Guidelines */}
          <div className="space-y-6">
            {/* Role Guidelines */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Role Guidelines</h2>
              
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FaInfoCircle className="text-blue-600" />
                  <h3 className="font-semibold">Common Roles</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">Manager</span>
                    <span className="text-sm text-gray-600">Overall factory management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">Production</span>
                    <span className="text-sm text-gray-600">Pedha production supervision</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm">Quality</span>
                    <span className="text-sm text-gray-600">Quality control and testing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-md text-sm">Sales</span>
                    <span className="text-sm text-gray-600">Customer relations and sales</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <FaLightbulb className="text-yellow-500" />
                  <h3 className="font-semibold">Tips</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Set competitive salaries</li>
                  <li>• Include contact information</li>
                  <li>• Track joining dates</li>
                  <li>• Regular performance reviews</li>
                </ul>
              </div>
            </div>

            {/* Salary Guidelines */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Salary Guidelines</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold">Manager</div>
                  <div className="text-gray-600">₹25,000 - ₹50,000</div>
                </div>
                <div>
                  <div className="font-semibold">Supervisor</div>
                  <div className="text-gray-600">₹15,000 - ₹25,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
