'use client';
import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { authAPI } from '@/app/lib/api';

// ✅ Validation schema
const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Attempting login with:', { email: data.email });

      // Call backend API
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      console.log('Login response:', response);

      // Handle successful login
      if (response.success) {
        setMessage('Login successful! Redirecting...');

        // Store JWT token
        localStorage.setItem('token', response.data.token);

        // Prepare user data for context
        const userData = {
          id: response.data.user.id,
          username: response.data.user.username,
          fullName: response.data.user.username, // Map for compatibility
          email: response.data.user.email,
          role: response.data.user.role,
          isAdmin: response.data.user.role === 'admin',
        };

        // Update context
        login(userData);

        // Also save to localStorage for backwards compatibility
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUserIndex = users.findIndex(u => u.email === data.email);
        
        if (existingUserIndex === -1) {
          // Add user if not exists
          users.push({
            fullName: response.data.user.username,
            email: response.data.user.email,
            password: data.password, // Store for localStorage compatibility
          });
          localStorage.setItem('users', JSON.stringify(users));
        }

        // Redirect after delay
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err) {
      // Extract user-friendly error message
      let errorMsg = err.message || 'Login failed. Please try again.';

      // Handle specific error cases
      if (errorMsg.includes('Invalid email or password')) {
        errorMsg = '❌ Invalid email or password. Please check your credentials and try again.';
      } else if (errorMsg.includes('Account is deactivated')) {
        errorMsg = '🔒 Your account has been deactivated. Please contact support.';
      } else if (errorMsg.includes('Unable to connect to server')) {
        errorMsg = '🔌 Unable to connect to server. Please check if the backend is running on http://localhost:5000';
      }

      setError(errorMsg);

      // Log for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Login failed:', errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12 relative">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to continue to BlogSphere</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>

          {/* Messages */}
          {message && (
            <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-700 font-medium flex items-center gap-2">
                <span className="text-xl">✅</span>
                {message}
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 font-medium flex items-center gap-2">
                <span className="text-xl">❌</span>
                {error}
              </p>
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/auth/register')}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-semibold disabled:text-gray-400"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;