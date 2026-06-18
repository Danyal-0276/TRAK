const FEED_CACHE_TTL_MS = 10 * 60 * 1000;
const BOOKMARK_TAB_CACHE_TTL_MS = 5 * 60 * 1000;

let homeFeedCache = null;
let bookmarkTabCache = null;

export function isFeedCacheFresh(entry) {
    return Boolean(entry && Date.now() - entry.savedAt < FEED_CACHE_TTL_MS);
}

export function isBookmarkTabCacheFresh(entry) {
    return Boolean(
        entry &&
        Date.now() - entry.savedAt < BOOKMARK_TAB_CACHE_TTL_MS &&
        Array.isArray(entry.items),
    );
}

export function getHomeFeedCache() {
    return homeFeedCache;
}

export function getBookmarkTabCache() {
    return bookmarkTabCache;
}

export function saveHomeFeedCache(payload) {
    homeFeedCache = {
        ...payload,
        savedAt: Date.now(),
    };
}

export function saveBookmarkTabCache(items) {
    bookmarkTabCache = {
        items: Array.isArray(items) ? items : [],
        savedAt: Date.now(),
    };
}

export function clearHomeFeedCache() {
    homeFeedCache = null;
}

export function clearBookmarkTabCache() {
    bookmarkTabCache = null;
}
