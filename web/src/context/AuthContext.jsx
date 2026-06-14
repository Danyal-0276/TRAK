import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from '../firebase';
import { getFirebaseAuthErrorMessage } from '../utils/firebaseAuthErrors';
import {
  markGoogleRedirectPending,
  clearGoogleRedirectPending,
  resolveFirebaseUserAfterRedirect,
  stashGoogleAuthReturn,
  runGoogleRedirectExchange,
} from '../utils/googleRedirectSession';
import {
    clearAuthTokens,
    completeSocialOAuth,
    getAccessToken,
    getRefreshToken,
    getCurrentUser,
    loginWithEmailPassword,
    loginWithFirebase,
    loginWithOtp,
    loginWithSocial,
    registerWithEmail,
    requestOtp,
    saveAuthSession,
} from '../utils/Service/api';
import { registerDeviceToken } from '../api/notificationsApi';
import { getOrCreatePushToken } from '../api/pushToken';
import {
    resendEmailVerification,
    verifyEmailCode,
} from '../api/authEmailApi';
import { emitAuthSessionEnded, onAuthSessionEnded } from '../utils/authSessionEvents';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getCurrentUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUser(getCurrentUser());
        setLoading(false);
    }, []);

    useEffect(() => {
        return onAuthSessionEnded(() => {
            clearAuthTokens();
            setUser(null);
        });
    }, []);

    const applySession = (session) => {
        saveAuthSession(session);
        setUser(session.user);
        // Fire-and-forget — do not block login/signup completion
        setTimeout(() => {
            registerDeviceToken(getOrCreatePushToken(), 'web').catch(() => {});
        }, 0);
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

    const finishGoogleRedirectLogin = useCallback(async () => {
        if (!isFirebaseConfigured()) return null;
        return runGoogleRedirectExchange(async () => {
            try {
                const auth = getFirebaseAuth();
                const firebaseUser = await resolveFirebaseUserAfterRedirect(auth);
                if (!firebaseUser) return null;
                const idToken = await firebaseUser.getIdToken();
                const session = await loginWithFirebase(idToken);
                const user = applySession(session);
                clearGoogleRedirectPending();
                return { user, ...session };
            } catch (err) {
                clearGoogleRedirectPending();
                throw new Error(getFirebaseAuthErrorMessage(err));
            }
        });
    }, []);

    const loginWithGoogle = async ({ returnTo } = {}) => {
        if (!isFirebaseConfigured()) {
            throw new Error(
                'Google sign-in is not configured. Add VITE_FIREBASE_* keys in Vercel env (or TRAK/web/.env), then redeploy.'
            );
        }
        try {
            if (import.meta.env.PROD) {
                stashGoogleAuthReturn(returnTo);
                markGoogleRedirectPending();
                await signInWithRedirect(getFirebaseAuth(), getGoogleProvider());
                return null;
            }
            const result = await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
            const idToken = await result.user.getIdToken();
            const session = await loginWithFirebase(idToken);
            const user = applySession(session);
            return { user, ...session };
        } catch (err) {
            throw new Error(getFirebaseAuthErrorMessage(err));
        }
    };

    const logout = () => {
        clearAuthTokens();
        setUser(null);
        emitAuthSessionEnded('manual');
    };

    const verifyEmail = async (code) => {
        const data = await verifyEmailCode(code);
        if (data?.user) {
            saveAuthSession({
                access: getAccessToken(),
                refresh: getRefreshToken(),
                user: data.user,
            });
            setUser(data.user);
        }
        return data;
    };

    const resendVerificationEmail = () => resendEmailVerification();

    const value = {
        user,
        isAdmin: user?.role === 'admin',
        isSuperAdmin: Boolean(user?.is_super_admin),
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        socialLogin,
        completeSocialLogin,
        loginWithGoogle,
        finishGoogleRedirectLogin,
        isAuthenticated: Boolean(getAccessToken() && user),
        isFirebaseConfigured: isFirebaseConfigured(),
        logout,
        verifyEmail,
        resendVerificationEmail,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
