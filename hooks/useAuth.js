'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Email/Password Sign Up
  const signUp = async (email, password, displayName) => {
    try {
      const result = await authAPI.signup(email, password, displayName);
      
      if (result.success) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        return { success: true, user: result.user };
      }
      
      return { success: false, error: result.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Email/Password Sign In
  const signIn = async (email, password) => {
    try {
      const result = await authAPI.signin(email, password);
      
      if (result.success) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        return { success: true, user: result.user };
      }
      
      return { success: false, error: result.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    token,
    signUp,
    signIn,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
