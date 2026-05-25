const FEED_CACHE_TTL_MS = 10 * 60 * 1000;

let homeFeedCache = null;

export function isFeedCacheFresh(entry) {
    return Boolean(entry && Date.now() - entry.savedAt < FEED_CACHE_TTL_MS);
}

export function getHomeFeedCache() {
    return homeFeedCache;
}

export function saveHomeFeedCache(payload) {
    homeFeedCache = {
        ...payload,
        savedAt: Date.now(),
    };
}

export function clearHomeFeedCache() {
    homeFeedCache = null;
}
