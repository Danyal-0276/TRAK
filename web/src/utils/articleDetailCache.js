import { getUserArticleDetail, getAccessToken } from '../utils/Service/api';

const cache = new Map();
const inflight = new Map();

/**
 * Prefetch article detail (deduped). Returns cached doc if available.
 * @param {string} id
 */
export function prefetchArticleDetail(id) {
  const key = String(id || '').trim();
  if (!key || !getAccessToken() || cache.has(key) || inflight.has(key)) return inflight.get(key);

  const promise = getUserArticleDetail(key)
    .then((doc) => {
      cache.set(key, doc);
      inflight.delete(key);
      return doc;
    })
    .catch(() => {
      inflight.delete(key);
      return null;
    });

  inflight.set(key, promise);
  return promise;
}

export function getCachedArticleDetail(id) {
  return cache.get(String(id || '').trim()) || null;
}

export function setCachedArticleDetail(id, doc) {
  if (id && doc) cache.set(String(id), doc);
}
