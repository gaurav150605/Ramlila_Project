'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { authService } from '@/lib/auth';

type Role = 'Admin' | 'Manager' | 'Employee';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee' as Role,
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Trim inputs
      const fullName = formData.fullName.trim();
      const username = formData.username.trim();
      const email = formData.email.trim();

      if (!fullName || !username || !email) {
        setError('All fields are required');
        return;
      }

      if (!validateEmail(email)) {
        setError('Invalid email format');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      // ✅ Await async register
      const result = await authService.register({
        fullName,
        username,
        email,
        password: formData.password,
        role: formData.role,
      });

      if (result?.success) {
        router.push('/login');
      } else {
        setError(result?.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-8 text-white text-center">
          <div className="text-4xl mb-2">🍬</div>
          <h1 className="text-2xl font-bold">Ramlila Pedhewale Factory</h1>
          <p className="text-sm text-gray-300">Create Your Account</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name */}
              <InputField
                label="Full Name *"
                icon={<FaUser />}
                value={formData.fullName}
                onChange={(val) => setFormData({ ...formData, fullName: val })}
                placeholder="Enter your full name"
              />

              {/* Username */}
              <InputField
                label="Username *"
                icon={<span>@</span>}
                value={formData.username}
                onChange={(val) => setFormData({ ...formData, username: val })}
                placeholder="Choose a username"
              />

              {/* Email */}
              <InputField
                label="Email Address *"
                icon={<FaEnvelope />}
                type="email"
                value={formData.email}
                onChange={(val) => setFormData({ ...formData, email: val })}
                placeholder="Enter your email"
              />

              {/* Password */}
              <InputField
                label="Password *"
                icon={<FaLock />}
                type="password"
                value={formData.password}
                onChange={(val) => setFormData({ ...formData, password: val })}
                placeholder="Create a password"
              />

              {/* Confirm Password */}
              <InputField
                label="Confirm Password *"
                icon={<FaLock />}
                type="password"
                value={formData.confirmPassword}
                onChange={(val) =>
                  setFormData({ ...formData, confirmPassword: val })
                }
                placeholder="Confirm your password"
              />

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as Role,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">
                Already have an account?{' '}
              </span>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login here
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable Input Component */
function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
}
