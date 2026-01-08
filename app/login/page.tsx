'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '@/lib/auth';
import { store } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Authenticate user
    const result = authService.login(formData.username, formData.password);

    if (result.success && result.user) {
      // Reinitialize store with current user's data
      store.setUserId(result.user.id);
      // Redirect based on user role
      const redirectPath = authService.getRoleBasedRedirect(result.user.role);
      router.push(redirectPath);
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="text-4xl mb-2">🍬</div>
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">
              Ramlila Pedhewale Factory
            </h1>
            <p className="text-sm text-center text-gray-300">
              Traditional Sweet Manufacturing
            </p>
          </div>

          {/* Form Section */}
          <div className="px-6 py-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your email or username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-md font-medium hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
                <span>→</span>
              </button>

              {/* Registration Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Register here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

