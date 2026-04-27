import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    clearAuthTokens,
    completeSocialOAuth,
    getAccessToken,
    getCurrentUser,
    loginWithEmailPassword,
    loginWithOtp,
    loginWithSocial,
    registerWithEmail,
    requestOtp,
    saveAuthSession,
} from '../utils/Service/api';
import { registerDeviceToken } from '../api/notificationsApi';
import { getOrCreatePushToken } from '../api/pushToken';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getCurrentUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUser(getCurrentUser());
        setLoading(false);
    }, []);

    const applySession = (session) => {
        saveAuthSession(session);
        setUser(session.user);
        registerDeviceToken(getOrCreatePushToken(), 'web').catch(() => {});
        return session.user;
    };

    const login = async (email, password) => {
        const session = await loginWithEmailPassword(email, password);
        return applySession(session);
    };

    const register = async (email, password, passwordConfirm, fullName, phone) => {
        const session = await registerWithEmail(email, password, passwordConfirm, fullName, phone);
        return applySession(session);
    };

    const sendOtp = async (identity) => requestOtp(identity);

    const verifyOtp = async (identity, code) => {
        const session = await loginWithOtp(identity, code);
        return applySession(session);
    };

    const socialLogin = async (provider, email) => {
        const session = await loginWithSocial(provider, email);
        return applySession(session);
    };

    const completeSocialLogin = async (ticket) => {
        const session = await completeSocialOAuth(ticket);
        return applySession(session);
    };

    const logout = () => {
        clearAuthTokens();
        setUser(null);
    };

    const value = {
        user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        socialLogin,
        completeSocialLogin,
        isAuthenticated: Boolean(getAccessToken() && user),
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
