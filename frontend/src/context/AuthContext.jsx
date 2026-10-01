import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { translations } from '../locales/translations';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('arogya_token') || null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('arogya_lang') || 'en');

  // Translation helper function
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('arogya_lang', newLang);
  };

  // Load user profile on initial mount
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setPatientProfile(res.data.patientProfile);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('arogya_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('arogya_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Check credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        localStorage.setItem('arogya_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.data.success) {
        localStorage.setItem('arogya_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setPatientProfile(res.data.patientProfile);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Demo login failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('arogya_token');
    setToken(null);
    setUser(null);
    setPatientProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientProfile,
        token,
        loading,
        language,
        setLanguage: handleLanguageChange,
        t,
        login,
        register,
        demoLogin,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
