import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load token from localStorage on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔐 AuthProvider: Loading stored data');
    console.log('Stored token:', storedToken ? 'Present (length: ' + storedToken.length + ')' : 'Missing');
    console.log('Stored user:', storedUser ? JSON.parse(storedUser)?.email : 'Missing');
    
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user');
        }
      }
      
      // Fetch fresh user data
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken) => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Logging in:', email);
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('✅ Login successful, token received');
      
      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('🔐 Registering:', email);
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token, user } = response.data;
      
      console.log('✅ Registration successful, token received');
      
      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data?.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear everything
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};