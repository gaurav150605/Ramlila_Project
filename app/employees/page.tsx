'use client';
export const dynamic = "force-dynamic";


import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUsers, FaSearch, FaPlus, FaDollarSign, FaEdit, FaEye, FaTrash, FaCalendarCheck, FaCalendarAlt, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight, FaInfoCircle, FaWhatsapp, FaArrowLeft } from 'react-icons/fa';
import { store, type Employee, type AdvanceRecord } from '@/lib/store';

export default function EmployeesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Leave'>('Present');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCalendarEmployee, setSelectedCalendarEmployee] = useState<Employee | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Advance Salary States
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceEmployee, setAdvanceEmployee] = useState<Employee | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceReason, setAdvanceReason] = useState('');
  const [advancesTrigger, setAdvancesTrigger] = useState(0); // For forcing UI refresh on advance update

  // View Mode: Employee List ('list') vs Salary Reports ('salary-reports')
  const [viewMode, setViewMode] = useState<'list' | 'salary-reports'>('list');

  // Pagination & Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  useEffect(() => {
    setEmployees(store.getEmployees());
  }, []);

  const getEmployeeAttendanceCount = (employeeId: string) => {
    return store.getEmployeeAttendanceCount(employeeId, currentMonth.toString(), currentYear.toString());
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getEmployeeAdvances = (employeeId: string) => {
    return store.getAdvances(employeeId, currentMonth.toString(), currentYear.toString());
  };

  const getEmployeeTotalAdvance = (employeeId: string) => {
    const records = getEmployeeAdvances(employeeId);
    return records.reduce((sum, r) => sum + r.amount, 0);
  };

  const calculateSalary = (employee: Employee) => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const presentDays = getEmployeeAttendanceCount(employee.id);
    const dailySalary = employee.salary / daysInMonth;
    const totalAdvance = getEmployeeTotalAdvance(employee.id);
    return Math.round(dailySalary * presentDays) - totalAdvance;
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.contact.includes(searchQuery)
  );

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: any = a[key as keyof Employee];
    let bValue: any = b[key as keyof Employee];

    if (key === 'calculatedSalary') {
      aValue = calculateSalary(a);
      bValue = calculateSalary(b);
    } else if (key === 'presentDays') {
      aValue = getEmployeeAttendanceCount(a.id);
      bValue = getEmployeeAttendanceCount(b.id);
    } else if (key === 'advance') {
      aValue = getEmployeeTotalAdvance(a.id);
      bValue = getEmployeeTotalAdvance(b.id);
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig, currentMonth, currentYear]);

  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(sortedEmployees.length / rowsPerPage);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <FaSort className="ml-2 opacity-40" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="ml-2" /> : <FaSortDown className="ml-2" />;
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const averageSalary = employees.length > 0 
    ? employees.reduce((sum, e) => sum + e.salary, 0) / employees.length 
    : 0;
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  const totalAdvancesThisMonth = employees.reduce((sum, e) => sum + getEmployeeTotalAdvance(e.id), 0);
  const totalPayrollThisMonth = employees.reduce((sum, e) => sum + calculateSalary(e), 0);

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

  const handleViewCalendar = (employee: Employee) => {
    setSelectedCalendarEmployee(employee);
    setShowCalendarModal(true);
  };

  // Advance Salary Helpers
  const handleOpenAdvanceModal = (employee: Employee) => {
    setAdvanceEmployee(employee);
    setAdvanceAmount('');
    setAdvanceDate(new Date().toISOString().split('T')[0]);
    setAdvanceReason('');
    setShowAdvanceModal(true);
  };

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceEmployee || !advanceAmount || Number(advanceAmount) <= 0) {
      alert('Please enter a valid advance amount.');
      return;
    }

    store.addAdvance({
      id: Date.now().toString(),
      employeeId: advanceEmployee.id,
      amount: Number(advanceAmount),
      date: advanceDate,
      reason: advanceReason || undefined,
    });

    setAdvancesTrigger(prev => prev + 1);
    setShowAdvanceModal(false);
    setAdvanceEmployee(null);
    alert('Advance registered successfully!');
  };

  const handleDeleteAdvance = (id: string) => {
    if (confirm('Are you sure you want to delete this advance record?')) {
      store.deleteAdvance(id);
      setAdvancesTrigger(prev => prev + 1);
    }
  };

  // WhatsApp Salary Share Helpers
  const formatWhatsAppNumber = (contact: string) => {
    const clean = contact.replace(/\D/g, '');
    return clean.startsWith('91') ? clean : clean.startsWith('0') ? '91' + clean.slice(1) : '91' + clean;
  };

  const generateSalaryMessage = (employee: Employee) => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const presentDays = getEmployeeAttendanceCount(employee.id);
    const dailySalary = employee.salary / daysInMonth;
    const grossSalary = Math.round(dailySalary * presentDays);
    const totalAdvance = getEmployeeTotalAdvance(employee.id);
    const netPayable = grossSalary - totalAdvance;
    const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

    return `🏭 Ramlila Pedhewale Factory
📅 Salary Slip - ${monthName} ${currentYear}

👤 Employee: ${employee.name}
📞 Mobile: ${employee.contact}
💼 Role: ${employee.role}
📆 Joining Date: ${employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}

📊 Salary Details:
• Basic Salary: ₹${employee.salary.toLocaleString()}
• Present Days: ${presentDays} / ${daysInMonth} days
• Gross Salary: ₹${grossSalary.toLocaleString()}
• Advance Taken: ₹${totalAdvance.toLocaleString()}
• 💰 Net Payable: ₹${netPayable.toLocaleString()}

✅ Status: ${employee.status}
Thank you! 🙏`;
  };

  const handleWhatsAppShare = (employee: Employee) => {
    const message = generateSalaryMessage(employee);
    const mobile = formatWhatsAppNumber(employee.contact);
    const url = `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareAll = () => {
    const activeEmployees = employees.filter(e => e.status === 'Active');
    if (activeEmployees.length === 0) {
      alert('No active employees found to share salary info.');
      return;
    }
    
    alert(`Starting WhatsApp Share for ${activeEmployees.length} active employees. Please make sure pop-ups are allowed.`);

    activeEmployees.forEach((employee, index) => {
      setTimeout(() => {
        handleWhatsAppShare(employee);
      }, index * 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <FaUsers className="text-3xl text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold">
                {viewMode === 'list' ? 'Employee Management' : 'Salary Reports'}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {viewMode === 'list' ? (
                <>
                  <Link
                    href="/employees/add"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base shadow-sm font-medium"
                  >
                    <FaPlus />
                    <span>Add Employee</span>
                  </Link>
                  <button
                    onClick={() => setViewMode('salary-reports')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm sm:text-base shadow-sm font-medium"
                  >
                    <FaDollarSign />
                    <span>Salary Reports</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleShareAll}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2 text-sm sm:text-base shadow-sm font-medium animate-pulse"
                  >
                    <FaWhatsapp className="text-lg" />
                    <span>Share All (WhatsApp)</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2 text-sm sm:text-base shadow-sm font-medium"
                  >
                    <FaArrowLeft />
                    <span>Back to Employees</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Month/Year Selector & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Month:</label>
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Employees Table */}
          <div className="overflow-x-auto mb-6 bg-white border border-gray-200 rounded-lg">
            <table className="w-full min-w-[900px] text-sm sm:text-base">
              <thead>
                <tr className="bg-blue-600 text-white border-b border-blue-700">
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('name')}>
                    <div className="flex items-center">Name <SortIcon columnKey="name" /></div>
                  </th>
                  {viewMode === 'list' && (
                    <>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none hidden sm:table-cell" onClick={() => handleSort('role')}>
                        <div className="flex items-center">Role <SortIcon columnKey="role" /></div>
                      </th>
                      <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none hidden md:table-cell" onClick={() => handleSort('joiningDate')}>
                        <div className="flex items-center">Joining Date <SortIcon columnKey="joiningDate" /></div>
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('salary')}>
                    <div className="flex items-center">Basic Salary <SortIcon columnKey="salary" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('presentDays')}>
                    <div className="flex items-center">Present Days <SortIcon columnKey="presentDays" /></div>
                  </th>
                  {viewMode === 'salary-reports' && (
                    <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none">
                      <div className="flex items-center">Gross Salary</div>
                    </th>
                  )}
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('advance')}>
                    <div className="flex items-center">Advance <SortIcon columnKey="advance" /></div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none" onClick={() => handleSort('calculatedSalary')}>
                    <div className="flex items-center group relative">
                      {viewMode === 'list' ? 'Calculated Salary' : 'Net Payable'} <FaInfoCircle className="ml-1 text-blue-200 opacity-80" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-gray-900 text-white text-xs rounded py-1 px-2 text-center z-10 shadow-lg">
                        Formula: (Basic Salary ÷ Days in Month × Present Days) - Total Advance
                      </div>
                      <SortIcon columnKey="calculatedSalary" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-blue-700 select-none hidden lg:table-cell" onClick={() => handleSort('status')}>
                    <div className="flex items-center">Status <SortIcon columnKey="status" /></div>
                  </th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={viewMode === 'list' ? 9 : 8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                        <FaUsers className="text-4xl opacity-20" />
                        <p className="text-lg font-medium text-gray-700">No employees found.</p>
                        <p className="text-sm">Click "Add Employee" to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((employee) => {
                    const presentDays = getEmployeeAttendanceCount(employee.id);
                    const calculatedSalary = calculateSalary(employee);
                    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
                    const dailySalary = employee.salary / daysInMonth;
                    const grossSalary = Math.round(dailySalary * presentDays);
                    const totalAdvance = getEmployeeTotalAdvance(employee.id);
                    
                    return (
                      <tr key={employee.id} className="border-b hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.contact}</div>
                          </div>
                        </td>
                        {viewMode === 'list' && (
                          <>
                            <td className="px-4 py-3 text-gray-700 hidden sm:table-cell">{employee.role}</td>
                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{employee.joiningDate}</td>
                          </>
                        )}
                        <td className="px-4 py-3 font-semibold text-gray-700">₹{employee.salary.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold whitespace-nowrap">
                            {presentDays} days
                          </span>
                        </td>
                        {viewMode === 'salary-reports' && (
                          <td className="px-4 py-3 font-semibold text-gray-700">₹{grossSalary.toLocaleString()}</td>
                        )}
                        <td className="px-4 py-3 font-semibold text-red-500">
                          ₹{totalAdvance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          ₹{calculatedSalary.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            {viewMode === 'list' ? (
                              <>
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
                                  onClick={() => handleViewCalendar(employee)}
                                  className="bg-purple-100 text-purple-700 p-2 rounded hover:bg-purple-200 transition-colors"
                                  title="View Calendar"
                                >
                                  <FaCalendarAlt />
                                </button>
                                <button
                                  onClick={() => handleOpenAdvanceModal(employee)}
                                  className="bg-orange-100 text-orange-700 p-2 rounded hover:bg-orange-200 transition-colors"
                                  title="Advance Salary"
                                >
                                  💰
                                </button>
                                <button
                                  onClick={() => handleWhatsAppShare(employee)}
                                  className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 transition-colors"
                                  title="Share via WhatsApp"
                                >
                                  📲
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
                              </>
                            ) : (
                              <button
                                onClick={() => handleWhatsAppShare(employee)}
                                className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 transition-colors flex items-center space-x-1"
                                title="Share via WhatsApp"
                              >
                                <span className="text-green-600 font-bold">📲</span>
                                <span className="text-xs font-semibold hidden sm:inline text-green-700">Share Slip</span>
                              </button>
                            )}
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
                    Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, sortedEmployees.length)}</span> of{' '}
                    <span className="font-medium">{sortedEmployees.length}</span> results
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 pt-4 border-t border-gray-100">
            <div className="bg-blue-500 text-white rounded-lg p-5 shadow-sm">
              <div className="text-xs mb-2 opacity-90 uppercase tracking-wider font-semibold">Total Employees</div>
              <div className="text-2xl sm:text-3xl font-bold">{totalEmployees}</div>
            </div>
            <div className="bg-green-500 text-white rounded-lg p-5 shadow-sm">
              <div className="text-xs mb-2 opacity-90 uppercase tracking-wider font-semibold">Active</div>
              <div className="text-2xl sm:text-3xl font-bold">{activeEmployees}</div>
            </div>
            <div className="bg-cyan-500 text-white rounded-lg p-5 shadow-sm">
              <div className="text-xs mb-2 opacity-90 uppercase tracking-wider font-semibold">Average Salary</div>
              <div className="text-2xl sm:text-3xl font-bold">₹{Math.round(averageSalary).toLocaleString()}</div>
            </div>
            <div className="bg-orange-500 text-white rounded-lg p-5 shadow-sm">
              <div className="text-xs mb-2 opacity-90 uppercase tracking-wider font-semibold">Total Advances (Month)</div>
              <div className="text-2xl sm:text-3xl font-bold">₹{totalAdvancesThisMonth.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-500 text-white rounded-lg p-5 shadow-sm">
              <div className="text-xs mb-2 opacity-90 uppercase tracking-wider font-semibold">Net Payroll (Month)</div>
              <div className="text-2xl sm:text-3xl font-bold">₹{totalPayrollThisMonth.toLocaleString()}</div>
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
              <div className="flex space-x-4 mt-6">
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

      {/* Calendar Modal */}
      {showCalendarModal && selectedCalendarEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Attendance Calendar: {selectedCalendarEmployee.name}</h2>
              <button onClick={() => setShowCalendarModal(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold text-gray-600">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const daysInMonth = getDaysInMonth(currentMonth, currentYear);
                const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
                const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="p-2"></div>);
                
                const attendanceRecords = store.getAttendance(selectedCalendarEmployee.id, currentMonth.toString(), currentYear.toString());
                const days = Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const record = attendanceRecords.find(a => a.date === dateStr);
                  
                  let bgColor = 'bg-gray-100';
                  let textColor = 'text-gray-800';
                  if (record) {
                    if (record.status === 'Present') {
                      bgColor = 'bg-green-200';
                      textColor = 'text-green-800';
                    } else if (record.status === 'Absent') {
                      bgColor = 'bg-red-200';
                      textColor = 'text-red-800';
                    } else if (record.status === 'Leave') {
                      bgColor = 'bg-yellow-200';
                      textColor = 'text-yellow-800';
                    }
                  }
                  
                  return (
                    <div key={day} className={`p-2 border border-gray-200 rounded text-center ${bgColor} ${textColor}`}>
                      <div className="font-bold">{day}</div>
                      <div className="text-xs">{record ? record.status : '-'}</div>
                    </div>
                  );
                });
                
                return [...blanks, ...days];
              })()}
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-green-200 rounded-full"></div><span>Present</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-red-200 rounded-full"></div><span>Absent</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-yellow-200 rounded-full"></div><span>Leave</span></div>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance Modal */}
      {showAdvanceModal && advanceEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <span>💰</span>
              <span>Advance Salary Form</span>
            </h2>
            <form onSubmit={handleAddAdvance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name (Read-only)
                </label>
                <input
                  type="text"
                  value={advanceEmployee.name}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 font-medium text-gray-700"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Advance Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter amount"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Advance *
                  </label>
                  <input
                    type="date"
                    required
                    value={advanceDate}
                    onChange={(e) => setAdvanceDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason/Note (Optional)
                </label>
                <textarea
                  placeholder="E.g., Medical expense, Festival advance"
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvanceModal(false);
                    setAdvanceEmployee(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                  Register Advance
                </button>
              </div>
            </form>

            {/* Advance History Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
                <span>🕒</span>
                <span>Advance History (All-Time)</span>
              </h3>
              {(() => {
                const history = store.getAdvances(advanceEmployee.id);
                if (history.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 italic">No past advances recorded for this employee.</p>
                  );
                }
                return (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-200">
                    {history
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((adv) => (
                        <div key={adv.id} className="p-3 flex justify-between items-center text-sm hover:bg-gray-50">
                          <div>
                            <div className="font-semibold text-gray-900">₹{adv.amount.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{adv.date} {adv.reason && `• ${adv.reason}`}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdvance(adv.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                );
              })()}
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
