'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ✅ Yup validation schema
const signupSchema = Yup.object().shape({
  fullName: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
  });

  const onSubmit = (data) => {
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

    // Check if email already exists
    const userExists = existingUsers.find((u) => u.email === data.email);
    if (userExists) {
      setError('Email is already registered.');
      setMessage('');
      return;
    }

    // Save new user
    const updatedUsers = [...existingUsers, data];
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setError('');
    setMessage('Account created successfully! Now you can log in.');
    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12 relative">
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 mt-15">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join BlogSphere and start writing</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="John Doe"
                {...register('fullName')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
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
            className="w-full cursor-pointer bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create Account
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

        {/* Switch to Login */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/auth/login')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
