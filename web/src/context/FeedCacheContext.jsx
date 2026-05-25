import React, { createContext, useCallback, useContext, useRef } from 'react';

const FEED_CACHE_TTL_MS = 10 * 60 * 1000;

const FeedCacheContext = createContext(null);

export function FeedCacheProvider({ children }) {
    const homeRef = useRef(null);
    const exploreRef = useRef(new Map());

    const isFresh = useCallback((entry) => {
        return Boolean(entry && Date.now() - entry.savedAt < FEED_CACHE_TTL_MS);
    }, []);

    const getHomeFeed = useCallback(() => homeRef.current, []);

    const saveHomeFeed = useCallback((payload) => {
        homeRef.current = {
            ...payload,
            savedAt: Date.now(),
        };
    }, []);

    const getExploreFeed = useCallback((queryKey) => {
        return exploreRef.current.get(String(queryKey || '').trim().toLowerCase()) || null;
    }, []);

    const saveExploreFeed = useCallback((queryKey, payload) => {
        exploreRef.current.set(String(queryKey || '').trim().toLowerCase(), {
            ...payload,
            savedAt: Date.now(),
        });
    }, []);

    const value = {
        isFresh,
        getHomeFeed,
        saveHomeFeed,
        getExploreFeed,
        saveExploreFeed,
    };

    return (
        <FeedCacheContext.Provider value={value}>
            {children}
        </FeedCacheContext.Provider>
    );
}

export function useFeedCache() {
    const ctx = useContext(FeedCacheContext);
    if (!ctx) {
        throw new Error('useFeedCache must be used within FeedCacheProvider');
    }
    return ctx;
}
