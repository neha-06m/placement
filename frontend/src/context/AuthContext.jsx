import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('placemate_token') || null);
  const [loading, setLoading] = useState(true);

  // Auto-restore session from stored JWT on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('placemate_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    if (data.token) {
      localStorage.setItem('placemate_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    if (data.token) {
      localStorage.setItem('placemate_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('placemate_token');
    setToken(null);
    setUser(null);
  };

  const getDashboardPath = (userRole) => {
    const role = userRole || user?.role;
    switch (role) {
      case 'student':
        return '/dashboard/student';
      case 'company':
        return '/dashboard/company';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        getDashboardPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
