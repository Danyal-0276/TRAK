import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_PREFIX, API_BASE } from '../config/api';
import { apiFetch, getAccessToken, setTokens } from '../api/client';
import { clearAuthSession as clearStoredAuthSession, saveAuthSession } from '../utils/Service/api';
import { registerDeviceToken, unregisterDeviceToken } from '../api/notificationsApi';
import { verifyEmailCode } from '../api/authEmailApi';
import { syncPushTokenWithBackend, unregisterPushTokenFromBackend } from '../api/pushToken';
import { formatNetworkError } from '../utils/networkError';
import { emitAuthSessionEnded, onAuthSessionEnded } from '../utils/authSessionEvents';
import { clearProfileSessionCache } from '../utils/profileSessionCache';
import { clearAdminSessionCache } from '../utils/adminSessionCache';

const AuthContext = createContext(null);
const USER_CACHE_KEY = 'trak_user_cache_v1';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bootstrapped, setBootstrapped] = useState(false);

    const fetchMe = useCallback(async () => {
        const res = await apiFetch(`${AUTH_PREFIX}/me/`, {}, API_BASE);
        if (res.status === 401) {
            await AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
            emitAuthSessionEnded();
            return { __sessionInvalid: true };
        }
        if (!res.ok) return null;
        const data = await res.json();
        await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(data)).catch(() => {});
        return data;
    }, []);

    const bootstrap = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) {
                setUser(null);
                await AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
                setBootstrapped(true);
                setLoading(false);
                return;
            }
            const cachedRaw = await AsyncStorage.getItem(USER_CACHE_KEY).catch(() => null);
            if (cachedRaw) {
                try {
                    const cachedUser = JSON.parse(cachedRaw);
                    if (cachedUser && typeof cachedUser === 'object') {
                        setUser(cachedUser);
                    }
                } catch (_) {
                    // ignore invalid cache
                }
            }
            // Unblock UI immediately after local session restore.
            setBootstrapped(true);
            setLoading(false);

            // Refresh user + push token in background (non-blocking).
            (async () => {
                try {
                    const me = await fetchMe();
                    if (me?.__sessionInvalid) {
                        // Server explicitly rejected our tokens — sign the user out.
                        await clearStoredAuthSession();
                        await AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
                        setUser(null);
                        return;
                    }
                    if (me) setUser(me);
                    if (me) {
                        await syncPushTokenWithBackend(registerDeviceToken);
                    }
                } catch {
                    // Keep cached/saved session on transient failures (network only).
                }
            })();
            return;
        } catch {
            // Keep cached/saved session on transient network issues.
        } finally {
            setBootstrapped(true);
            setLoading(false);
        }
    }, [fetchMe]);

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    useEffect(() => {
        return onAuthSessionEnded(() => {
            clearStoredAuthSession();
            clearProfileSessionCache();
            clearAdminSessionCache();
            AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
            setUser(null);
        });
    }, []);

    const login = async (email, password) => {
        const normalizedPassword = typeof password === 'string' ? password.trim() : password;
        const url = `${AUTH_PREFIX}/login/`;
        if (__DEV__) {
            console.warn('[auth] login POST', url);
        }
        let res;
        try {
            res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password: normalizedPassword }),
            });
        } catch (err) {
            throw new Error(formatNetworkError(err, 'sign in'));
        }
        const rawText = await res.text();
        let data = {};
        if (rawText.trim()) {
            try {
                data = JSON.parse(rawText);
            } catch {
                if (rawText.includes('Invalid HTTP_HOST')) {
                    throw new Error(
                        `Cannot reach Django at ${API_BASE}. Restart the server after pulling latest code, or use USB: adb reverse tcp:8000 tcp:8000 and ANDROID_USE_USB_REVERSE=true in api.local.js.`
                    );
                }
            }
        }
        if (!res.ok) {
            throw new Error(
                data.detail ||
                    data.non_field_errors?.[0] ||
                    (res.status === 401
                        ? 'Invalid email or password.'
                        : `Login failed (HTTP ${res.status}).`)
            );
        }
        await setTokens(data.access, data.refresh);
        const u = data.user || (await fetchMe());
        await saveAuthSession({ access: data.access, refresh: data.refresh, user: u });
        setUser(u);
        await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(u || {})).catch(() => {});
        await syncPushTokenWithBackend(registerDeviceToken);
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
        await saveAuthSession({ access: data.access, refresh: data.refresh, user: u });
        setUser(u);
        await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(u || {})).catch(() => {});
        await syncPushTokenWithBackend(registerDeviceToken);
        return u;
    };

    const logout = async () => {
        try {
            await unregisterPushTokenFromBackend(unregisterDeviceToken);
        } catch {
            /* best-effort before clearing session */
        }
        await clearStoredAuthSession();
        clearProfileSessionCache();
        clearAdminSessionCache();
        await AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
        setUser(null);
        emitAuthSessionEnded('manual');
    };

    const verifyEmail = async (code) => {
        const data = await verifyEmailCode(code);
        if (data?.user) {
            const access = await getAccessToken();
            const refresh = await AsyncStorage.getItem('trak_refresh_token');
            await saveAuthSession({ access, refresh, user: data.user });
            setUser(data.user);
            await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user || {})).catch(() => {});
        }
        return data;
    };

    const isAdmin = user?.role === 'admin';
    const isSuperAdmin = Boolean(user?.is_super_admin);

    const value = useMemo(
        () => ({
            user,
            loading,
            bootstrapped,
            isAdmin,
            isSuperAdmin,
            login,
            register,
            logout,
            bootstrap,
            refreshUser: fetchMe,
            verifyEmail,
        }),
        [user, loading, bootstrapped, isAdmin, isSuperAdmin, login, register, logout, bootstrap, fetchMe, verifyEmail]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
