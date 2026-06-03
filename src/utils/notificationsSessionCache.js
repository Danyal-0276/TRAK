const CACHE_TTL_MS = 10 * 60 * 1000;

let notificationsCache = { list: [], savedAt: 0 };

export function isNotificationsCacheFresh() {
  return (
    notificationsCache.list.length > 0 &&
    Date.now() - notificationsCache.savedAt < CACHE_TTL_MS
  );
}

export function getNotificationsCache() {
  return notificationsCache.list;
}

export function saveNotificationsCache(list) {
  notificationsCache = {
    list: Array.isArray(list) ? list : [],
    savedAt: Date.now(),
  };
}

export function clearNotificationsCache() {
  notificationsCache = { list: [], savedAt: 0 };
  backfillDone = false;
}

let backfillDone = false;

export function isNotificationBackfillDone() {
  return backfillDone;
}

export function markNotificationBackfillDone() {
  backfillDone = true;
}
