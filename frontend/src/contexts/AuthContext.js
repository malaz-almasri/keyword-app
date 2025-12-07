import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = process.env.REACT_APP_BACKEND_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Skip delay if just authenticated
      const justAuth = sessionStorage.getItem('just_authenticated');
      if (!justAuth) {
        await new Promise(r => setTimeout(r, 150));
      } else {
        sessionStorage.removeItem('just_authenticated');
      }

      const response = await axios.get(`${API}/api/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  const processSessionId = async (sessionId) => {
    try {
      const response = await axios.post(`${API}/api/auth/session`, {
        session_id: sessionId
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        sessionStorage.setItem('just_authenticated', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session processing error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, processSessionId, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
