'use client';
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Load user and token from localStorage on mount
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    if (storedToken) {
      setToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    // Sync user to localStorage when it changes (after initial load)
    if (!loading) {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [user, loading]);

  useEffect(() => {
    // Sync token to localStorage when it changes (after initial load)
    if (!loading) {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }, [token, loading]);

  const login = (userData, authToken = null) => {
    setUser(userData);
    
    // If token is provided, store it
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('token', authToken);
    }
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    router.push('/');
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('currentUser', JSON.stringify(newUserData));
  };

  const getToken = () => {
    return token || localStorage.getItem('token');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      token, 
      getToken,
      updateUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};