import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Set default API URL
const API_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios authorization header on token change
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  // Verify token on app load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Verify token failed:', err);
          setUser(null);
          setToken('');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Login action
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post('/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Register action
  const register = async (firstName, lastName, username, email, password, role) => {
    setError(null);
    try {
      const res = await axios.post('/auth/register', {
        firstName,
        lastName,
        username,
        email,
        password,
        role
      });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try a different username/email.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Logout action
  const logout = () => {
    setUser(null);
    setToken('');
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        setUser,
        API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
