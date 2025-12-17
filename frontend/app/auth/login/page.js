'use client';
import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';

// ✅ Validation schema
const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useContext(UserContext); // ✅ get login() function from context

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const matchedUser = users.find(
      (u) => u.email === data.email && u.password === data.password
    );

    if (matchedUser) {
      if (matchedUser.disabled) {
        setMessage('');
        setError('Your account has been disabled. Please contact the administrator.');
        return;
      }

      setError('');
      setMessage('Login successful! Redirecting to home...');
      
      
      login(matchedUser);

      // ✅ 2. Redirect after delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setMessage('');
      setError('Invalid email or password.');
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Log In
          </button>

          {/* ✅ Messages */}
          {message && (
            <div className="mt-4 text-center text-green-600 font-medium">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 text-center text-red-600 font-medium">
              {error}
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <button
            onClick={() => router.push('/auth/register')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
