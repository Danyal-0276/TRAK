import AsyncStorage from '@react-native-async-storage/async-storage';

export const ADMIN_SESSION_CACHE_KEY = 'trak_admin_session_cache_v1';

const ADMIN_CACHE_TTL_MS = 4 * 60 * 1000;

const session = {
  overview: null,
  lists: null,
  feedback: {},
};

let preloadPromise = null;

export function getAdminSessionCache() {
  return session;
}

export function isAdminOverviewFresh(entry = session.overview) {
  if (!entry?.fetchedAt) return false;
  if (Date.now() - entry.fetchedAt >= ADMIN_CACHE_TTL_MS) return false;
  return Boolean(entry.serverAnalytics || entry.analyticsError);
}

export function isAdminListsFresh(entry = session.lists) {
  if (!entry?.fetchedAt) return false;
  if (Date.now() - entry.fetchedAt >= ADMIN_CACHE_TTL_MS) return false;
  return Array.isArray(entry.notifications) && Boolean(entry.settings || entry.categories);
}

export function isAdminFeedbackFresh(statusKey, entry = session.feedback[statusKey]) {
  if (!entry?.fetchedAt) return false;
  return Date.now() - entry.fetchedAt < ADMIN_CACHE_TTL_MS;
}

export function getAdminFeedbackCache(statusKey) {
  return session.feedback[statusKey] || null;
}

export function clearAdminSessionCache() {
  session.overview = null;
  session.lists = null;
  session.feedback = {};
  preloadPromise = null;
  AsyncStorage.removeItem(ADMIN_SESSION_CACHE_KEY).catch(() => {});
}

export function setAdminOverviewCache(payload) {
  session.overview = { ...payload, fetchedAt: Date.now() };
  persistAdminSessionCache();
  return session.overview;
}

export function setAdminListsCache(payload) {
  session.lists = {
    ...(session.lists || {}),
    ...payload,
    fetchedAt: Date.now(),
  };
  persistAdminSessionCache();
  return session.lists;
}

export function setAdminFeedbackCache(statusKey, payload) {
  session.feedback[statusKey] = { ...payload, fetchedAt: Date.now() };
  persistAdminSessionCache();
  return session.feedback[statusKey];
}

async function persistAdminSessionCache() {
  try {
    await AsyncStorage.setItem(
      ADMIN_SESSION_CACHE_KEY,
      JSON.stringify({
        overview: session.overview,
        lists: session.lists,
        feedback: session.feedback,
      })
    );
  } catch {
    // ignore storage failures
  }
}

export async function hydrateAdminFromStorage() {
  if (session.overview || session.lists || Object.keys(session.feedback).length) return session;

  try {
    const raw = await AsyncStorage.getItem(ADMIN_SESSION_CACHE_KEY);
    if (!raw) return session;
    const parsed = JSON.parse(raw);
    if (parsed?.overview) session.overview = parsed.overview;
    if (parsed?.lists) session.lists = parsed.lists;
    if (parsed?.feedback && typeof parsed.feedback === 'object') {
      session.feedback = parsed.feedback;
    }
  } catch {
    // ignore invalid cache
  }

  return session;
}

export function preloadAdminData({ skipIfFresh = true, force = false } = {}) {
  if (!force && skipIfFresh && isAdminOverviewFresh() && isAdminListsFresh()) {
    return Promise.resolve(session);
  }
  if (preloadPromise) return preloadPromise;

  preloadPromise = import('../route/AdminScreen/loadAdminOverview')
    .then(({ loadAdminOverview }) => loadAdminOverview({ cacheBust: false }))
    .then(async (overviewData) => {
      let enriched = null;
      if (overviewData.serverAnalytics) {
        const { enrichAnalyticsSnapshot } = await import('../route/AdminScreen/dashboardChartUtils');
        enriched = {
          ...enrichAnalyticsSnapshot(overviewData.serverAnalytics, [], {
            connections: overviewData.connections || [],
          }),
          _refreshedAt: Date.now(),
        };
      }
      setAdminOverviewCache({
        serverAnalytics: enriched,
        modelMetrics: overviewData.modelMetrics || null,
        connections: overviewData.connections || [],
        analyticsError: overviewData.analyticsError || null,
        refreshedAt: Date.now(),
      });
      return session;
    })
    .catch(() => session)
    .finally(() => {
      preloadPromise = null;
    });

  return preloadPromise;
}
