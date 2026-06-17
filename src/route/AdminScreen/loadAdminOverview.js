import {
  getAdminAnalytics,
  getAdminArticles,
  getAdminModelMetrics,
  getAdminSettings,
} from '../../api/adminApi';
import { normAdminConnections } from '../../utils/adminLists';
import { isAnalyticsPayload } from './dashboardChartUtils';

/** Avoid polling model-metrics after 404 (file not trained yet). */
let modelMetricsUnavailable = false;

export async function loadAdminOverview({
  cacheBust = false,
  requireAnalytics = false,
  includeArticles = false,
  articlePageSize = 50,
} = {}) {
  let serverAnalytics = null;
  let modelMetrics = null;
  let articles = [];
  let connections = [];
  let analyticsError = null;

  const analyticsPromise = getAdminAnalytics({ cacheBust })
    .then((raw) => ({ ok: true, raw }))
    .catch((err) => ({ ok: false, err }));

  const metricsPromise = modelMetricsUnavailable
    ? Promise.resolve({ ok: true, data: null })
    : getAdminModelMetrics()
        .then((data) => ({ ok: true, data }))
        .catch((err) => ({ ok: false, err }));

  const settingsPromise = getAdminSettings()
    .then((settings) => ({ ok: true, settings }))
    .catch(() => ({ ok: false, settings: null }));

  const articlesPromise = includeArticles
    ? getAdminArticles({
        page: 1,
        pageSize: Math.min(100, Math.max(1, articlePageSize)),
        scope: 'all',
      })
        .then((res) => ({ ok: true, results: res.results || [] }))
        .catch(() => ({ ok: false, results: [] }))
    : Promise.resolve({ ok: true, results: [] });

  const [analyticsResult, metricsResult, settingsResult, articlesResult] = await Promise.all([
    analyticsPromise,
    metricsPromise,
    settingsPromise,
    articlesPromise,
  ]);

  if (analyticsResult.ok) {
    const raw = analyticsResult.raw;
    if (isAnalyticsPayload(raw)) {
      serverAnalytics = raw;
    } else {
      const detail = raw?.detail || raw?.message;
      analyticsError =
        typeof detail === 'string'
          ? detail
          : 'Analytics API returned an unexpected response. Sign in as admin and use a backend with MongoDB.';
      if (requireAnalytics) throw new Error(analyticsError);
    }
  } else {
    if (requireAnalytics) throw analyticsResult.err;
    analyticsError = analyticsResult.err?.message || 'Could not load analytics.';
    serverAnalytics = null;
  }

  if (metricsResult.ok) {
    modelMetrics = metricsResult.data;
  } else if (metricsResult.err?.status === 404) {
    modelMetricsUnavailable = true;
    modelMetrics = null;
  } else {
    modelMetrics = null;
  }

  if (settingsResult.ok && settingsResult.settings) {
    connections = normAdminConnections(settingsResult.settings.connections || []);
  }

  if (articlesResult.ok) {
    articles = articlesResult.results || [];
  }

  return {
    serverAnalytics,
    modelMetrics,
    articles,
    users: [],
    connections,
    analyticsError,
  };
}
