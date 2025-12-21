// frontend/app/hooks/useAuth.js
'use client';
import { useContext } from 'react';
import { UserContext } from '@/app/context/UserContext';

export const useAuth = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useAuth must be used within a UserProvider');
  }

  const { user, login, logout, loading, token, getToken, updateUser } = context;

  // Check if user is authenticated
  const isAuthenticated = !!user && !!getToken();

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  // Get authorization header for API calls
  const getAuthHeader = () => {
    const authToken = getToken();
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  };

  return {
    user,
    login,
    logout,
    loading,
    token,
    getToken,
    updateUser,
    isAuthenticated,
    isAdmin,
    getAuthHeader,
  };
};

export default useAuth;