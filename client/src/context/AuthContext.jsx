import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch fresh profile on load if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        } catch (err) {
          console.error('[Auth Error]: Failed to fetch profile', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, token: receivedToken } = res.data.data;
    setUser(loggedInUser);
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (!res.data || !res.data.data) {
      throw new Error(res.data?.message || 'Received unexpected response from server.');
    }
    const { user: registeredUser, token: receivedToken } = res.data.data;
    setUser(registeredUser);
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.post('/auth/logout').catch(() => {});
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    setUser(res.data.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.data.user));
    return res.data;
  };

  const changePassword = async (passwords) => {
    const res = await api.put('/auth/change-password', passwords);
    return res.data;
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
