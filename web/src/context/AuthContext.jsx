import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AUTH_PREFIX, API_BASE } from '../config/api';

const ACCESS_KEY = 'trak_access';
const REFRESH_KEY = 'trak_refresh';

const AuthContext = createContext(null);

async function storeTokens(access, refresh) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function getAccess() {
  return localStorage.getItem(ACCESS_KEY);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (token) => {
    const res = await fetch(`${AUTH_PREFIX}/me/`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    return res.json();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAccess();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      const me = await fetchMe(token);
      if (!cancelled) {
        setUser(me);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMe]);

  const login = async (email, password) => {
    const res = await fetch(`${AUTH_PREFIX}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.non_field_errors?.[0] || 'Invalid email or password');
    }
    await storeTokens(data.access, data.refresh);
    const u = data.user || (await fetchMe(data.access));
    setUser(u);
    return u;
  };

  const register = async (email, password, password_confirm) => {
    const res = await fetch(`${AUTH_PREFIX}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
        password_confirm,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        (typeof data === 'object' &&
          (data.email?.[0] || data.password?.[0] || data.detail || data.non_field_errors?.[0])) ||
        'Registration failed';
      throw new Error(msg);
    }
    await storeTokens(data.access, data.refresh);
    const u = data.user || (await fetchMe(data.access));
    setUser(u);
    return u;
  };

  const logout = () => {
    clearStoredTokens();
    setUser(null);
  };

  const value = {
    user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout,
    apiBase: API_BASE,
    getAccessToken: getAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
