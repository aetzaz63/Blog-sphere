'use client';
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false); // Mark as loaded
  }, []);

  useEffect(() => {
    if (!loading) { // Only update after initial load
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [user, loading]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};