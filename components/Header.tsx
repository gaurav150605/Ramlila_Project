'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FaHome, 
  FaShoppingCart, 
  FaWarehouse, 
  FaCookie, 
  FaChartBar, 
  FaUsers,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import { authService } from '@/lib/auth';
import { store } from '@/lib/store';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FaHome },
    { href: '/sales', label: 'Sales', icon: FaShoppingCart },
    { href: '/stock', label: 'Stock', icon: FaWarehouse },
    { href: '/products', label: 'Products', icon: FaCookie },
    { href: '/reports', label: 'Reports', icon: FaChartBar },
    { href: '/employees', label: 'Employees', icon: FaUsers },
  ];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    // Reinitialize store when user changes
    if (currentUser) {
      store.setUserId(currentUser.id);
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    authService.logout();
    store.setUserId(null);
    router.push('/login');
  };

  // Get role-based dashboard href
  const getDashboardHref = () => {
    if (!user) return '/dashboard';
    return authService.getRoleBasedRedirect(user.role);
  };

  // Update dashboard href in navItems
  const updatedNavItems = navItems.map(item => 
    item.href === '/dashboard' ? { ...item, href: getDashboardHref() } : item
  );

  if (!user) {
    return null; // Don't show header if user is not logged in
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">🍬</div>
          <div className="text-2xl font-bold">Ramlila Pedhewale Factory</div>
        </div>
        
        <nav className="flex items-center space-x-6">
          {updatedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href.includes('/dashboard') && pathname.includes('/dashboard'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-blue-800' : 'hover:bg-blue-800'
                }`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
          <FaUser className="text-xl" />
          <span className="font-medium">{user.fullName || 'User'}</span>
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-blue-800 px-3 py-1 rounded-md text-sm flex items-center space-x-1 hover:bg-blue-900 transition-colors"
            >
              <span className="capitalize">{user.role?.toLowerCase() || 'user'}</span>
              <span>▼</span>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

