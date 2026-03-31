import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AUTH_PREFIX, API_BASE } from '../config/api';
import { apiFetch, clearTokens, getAccessToken, setTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bootstrapped, setBootstrapped] = useState(false);

    const fetchMe = useCallback(async () => {
        const res = await apiFetch(`${AUTH_PREFIX}/me/`, {}, API_BASE);
        if (!res.ok) return null;
        const data = await res.json();
        return data;
    }, []);

    const bootstrap = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) {
                setUser(null);
                return;
            }
            const me = await fetchMe();
            setUser(me);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
            setBootstrapped(true);
        }
    }, [fetchMe]);

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    const login = async (email, password) => {
        const normalizedPassword = typeof password === 'string' ? password.trim() : password;
        const res = await fetch(`${AUTH_PREFIX}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password: normalizedPassword }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.detail || data.non_field_errors?.[0] || 'Login failed');
        }
        await setTokens(data.access, data.refresh);
        const u = data.user || (await fetchMe());
        setUser(u);
        return u;
    };

    const register = async (email, password, password_confirm) => {
        const res = await fetch(`${AUTH_PREFIX}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
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
        await setTokens(data.access, data.refresh);
        const u = data.user || (await fetchMe());
        setUser(u);
        return u;
    };

    const logout = async () => {
        await clearTokens();
        setUser(null);
    };

    const value = {
        user,
        loading,
        bootstrapped,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        bootstrap,
        refreshUser: fetchMe,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
