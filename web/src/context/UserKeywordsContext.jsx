import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { getUserKeywordsFromServer } from '../utils/Service/api';
import { getUserKeywords, setUserKeywords } from '../utils/userKeywordsStorage';

const CACHE_TTL_MS = 60_000;

function keywordsEqual(a, b) {
    const left = Array.isArray(a) ? a : [];
    const right = Array.isArray(b) ? b : [];
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i += 1) {
        if (left[i] !== right[i]) return false;
    }
    return true;
}

const UserKeywordsContext = createContext({
    keywords: [],
    loading: false,
    syncing: false,
    refresh: async () => [],
    hydrateKeywords: () => {},
});

export function UserKeywordsProvider({ children }) {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [keywords, setKeywords] = useState(() => getUserKeywords());
    const [syncing, setSyncing] = useState(false);
    const inflightRef = useRef(null);
    const cacheRef = useRef({ at: 0, userId: null });

    const userId = user?.id ?? user?.pk ?? null;

    const applyKeywords = useCallback((kws) => {
        const list = Array.isArray(kws) ? kws : [];
        setKeywords((prev) => (keywordsEqual(prev, list) ? prev : list));
        setUserKeywords(list);
        cacheRef.current = { at: Date.now(), userId };
        return list;
    }, [userId]);

    const hydrateKeywords = useCallback(
        (kws) => {
            applyKeywords(kws);
        },
        [applyKeywords]
    );

    const refresh = useCallback(async ({ force = false } = {}) => {
        if (!isAuthenticated || !userId) {
            setKeywords([]);
            cacheRef.current = { at: 0, userId: null };
            return [];
        }

        const { at, userId: cachedUserId } = cacheRef.current;
        const freshEnough = !force && cachedUserId === userId && Date.now() - at < CACHE_TTL_MS;
        if (freshEnough) {
            const cached = getUserKeywords();
            if (cached.length) setKeywords((prev) => (keywordsEqual(prev, cached) ? prev : cached));
            return cached;
        }

        if (inflightRef.current) return inflightRef.current;

        setSyncing(true);
        const promise = (async () => {
            try {
                const res = await getUserKeywordsFromServer();
                const kws = Array.isArray(res?.keywords) ? res.keywords : [];
                applyKeywords(kws);
                return kws;
            } catch {
                const local = getUserKeywords();
                setKeywords((prev) => (keywordsEqual(prev, local) ? prev : local));
                return local;
            } finally {
                setSyncing(false);
                inflightRef.current = null;
            }
        })();
        inflightRef.current = promise;
        return promise;
    }, [isAuthenticated, userId, applyKeywords]);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
            setKeywords([]);
            cacheRef.current = { at: 0, userId: null };
            return;
        }

        const cached = getUserKeywords();
        setKeywords((prev) => (keywordsEqual(prev, cached) ? prev : cached));
        if (cacheRef.current.userId !== userId) {
            cacheRef.current = { at: 0, userId };
        }
    }, [authLoading, isAuthenticated, userId]);

    useEffect(() => {
        const onChanged = (e) => {
            if (!Array.isArray(e?.detail)) return;
            setKeywords((prev) => (keywordsEqual(prev, e.detail) ? prev : e.detail));
            cacheRef.current = { at: Date.now(), userId };
        };
        window.addEventListener('trak-keywords-changed', onChanged);
        return () => window.removeEventListener('trak-keywords-changed', onChanged);
    }, [userId]);

    return (
        <UserKeywordsContext.Provider
            value={{
                keywords,
                loading: authLoading,
                syncing,
                refresh,
                hydrateKeywords,
            }}
        >
            {children}
        </UserKeywordsContext.Provider>
    );
}

export function useUserKeywords() {
    return useContext(UserKeywordsContext);
}
