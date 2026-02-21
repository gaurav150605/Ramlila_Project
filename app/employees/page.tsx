'use client';
export const dynamic = "force-dynamic";


import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUsers, FaSearch, FaPlus, FaDollarSign, FaEdit, FaEye, FaTrash, FaCalendarCheck } from 'react-icons/fa';
import { store, type Employee } from '@/lib/store';

export default function EmployeesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Leave'>('Present');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setEmployees(store.getEmployees());
  }, []);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.contact.includes(searchQuery)
  );

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const averageSalary = employees.length > 0 
    ? employees.reduce((sum, e) => sum + e.salary, 0) / employees.length 
    : 0;
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  const handleEdit = (id: string) => {
    router.push(`/employees/add?edit=${id}`);
  };

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      store.deleteEmployee(employeeToDelete.id);
      setEmployees(store.getEmployees());
      setEmployeeToDelete(null);
    }
  };

  const handleMarkAttendance = () => {
    if (!selectedEmployee) return;
    
    store.markAttendance({
      employeeId: selectedEmployee.id,
      date: attendanceDate,
      status: attendanceStatus,
    });

    alert('Attendance marked successfully!');
    setShowAttendanceModal(false);
    setSelectedEmployee(null);
  };

  const getEmployeeAttendanceCount = (employeeId: string) => {
    return store.getEmployeeAttendanceCount(employeeId, currentMonth.toString(), currentYear.toString());
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const calculateSalary = (employee: Employee) => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const presentDays = getEmployeeAttendanceCount(employee.id);
    const dailySalary = employee.salary / daysInMonth;
    return Math.round(dailySalary * presentDays);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FaUsers className="text-3xl text-blue-600" />
              <h1 className="text-3xl font-bold">Employee Management</h1>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/employees/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>+ Add New Employee</span>
              </Link>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2">
                <FaDollarSign />
                <span>Salary Reports</span>
              </button>
            </div>
          </div>

          {/* Month/Year Selector */}
          <div className="mb-6 flex items-center space-x-4">
            <label className="text-sm font-medium">Month:</label>
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium">Year:</label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Employees Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Joining Date</th>
                  <th className="px-4 py-3 text-left">Basic Salary</th>
                  <th className="px-4 py-3 text-left">Present Days</th>
                  <th className="px-4 py-3 text-left">Calculated Salary</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No employees found. Add your first employee to get started.
                  </td>
                </tr>
                ) : (
                  filteredEmployees.map((employee) => {
                    const presentDays = getEmployeeAttendanceCount(employee.id);
                    const calculatedSalary = calculateSalary(employee);
                    return (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.contact}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{employee.role}</td>
                        <td className="px-4 py-3">{employee.joiningDate}</td>
                        <td className="px-4 py-3 font-semibold">₹{employee.salary.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                            {presentDays} days
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          ₹{calculatedSalary.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowAttendanceModal(true);
                              }}
                              className="bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 transition-colors"
                              title="Mark Attendance"
                            >
                              <FaCalendarCheck />
                            </button>
                            <button
                              onClick={() => handleEdit(employee.id)}
                              className="bg-yellow-100 text-yellow-700 p-2 rounded hover:bg-yellow-200 transition-colors"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(employee)}
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-500 text-white rounded-lg p-6">
              <div className="text-sm mb-2">Total Employees</div>
              <div className="text-4xl font-bold">{totalEmployees}</div>
            </div>
            <div className="bg-green-500 text-white rounded-lg p-6">
              <div className="text-sm mb-2">Active</div>
              <div className="text-4xl font-bold">{activeEmployees}</div>
            </div>
            <div className="bg-cyan-500 text-white rounded-lg p-6">
              <div className="text-sm mb-2">Average Salary</div>
              <div className="text-4xl font-bold">₹{Math.round(averageSalary).toLocaleString()}</div>
            </div>
            <div className="bg-yellow-500 text-white rounded-lg p-6">
              <div className="text-sm mb-2">Total Monthly Payroll</div>
              <div className="text-4xl font-bold">₹{totalPayroll.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Attendance Modal */}
      {showAttendanceModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <input
                  type="text"
                  value={selectedEmployee.name}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value as 'Present' | 'Absent' | 'Leave')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowAttendanceModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAttendance}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>{employeeToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setEmployeeToDelete(null)}
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
