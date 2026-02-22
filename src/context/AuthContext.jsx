import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { connectSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      // Fix: _isProfileLoad tells the 401 interceptor not to redirect on token expiry
      const { data } = await API.get('/auth/profile', { _isProfileLoad: true });
      setUserState(data);
      connectSocket();
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUserState(data);
      connectSocket();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await API.post('/auth/register', payload);
      localStorage.setItem('token', data.token);
      setUserState(data);
      connectSocket();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    disconnectSocket();
    setUserState(null);
  };

  // Fix: always merge so isActive and other fields survive profile updates
  const setUser = (updates) => {
    if (typeof updates === 'function') {
      setUserState(updates);
    } else {
      setUserState(prev => ({ ...prev, ...updates }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}