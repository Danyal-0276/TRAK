import {
  getAdminAnalytics,
  getAdminArticles,
  getAdminModelMetrics,
  getAdminUsers,
} from '../../api/adminApi';
import { buildDashboardStatCards, isAnalyticsPayload } from './dashboardChartUtils';
import { MOCK_ANALYTICS } from './mockAdminData';

/** Avoid polling model-metrics after 404 (file not trained yet). */
let modelMetricsUnavailable = false;

/**
 * Same admin API bundle as mobile AdminScreen.loadData (overview slice).
 * Real data from Django `/api/admin/*`; mock analytics/keywords only when analytics API fails.
 */
export async function loadAdminOverview({ cacheBust = false, requireAnalytics = false } = {}) {
  let serverAnalytics = null;
  let modelMetrics = null;
  let articles = [];
  let users = [];

  let analyticsError = null;
  try {
    const raw = await getAdminAnalytics({ cacheBust });
    if (isAnalyticsPayload(raw)) {
      serverAnalytics = raw;
    } else {
      const detail = raw?.detail || raw?.message;
      analyticsError =
        typeof detail === 'string'
          ? detail
          : 'Analytics API returned an unexpected response.';
      if (requireAnalytics) throw new Error(analyticsError);
    }
  } catch (err) {
    if (requireAnalytics) throw err;
    analyticsError = err?.message || 'Could not load analytics.';
    serverAnalytics = null;
  }

  try {
    const res = await getAdminArticles({ page: 1, pageSize: 50, scope: 'all' });
    articles = res.results || [];
  } catch {
    articles = [];
  }

  if (!modelMetricsUnavailable) {
    try {
      modelMetrics = await getAdminModelMetrics();
    } catch (err) {
      if (err?.status === 404) {
        modelMetricsUnavailable = true;
      }
      modelMetrics = null;
    }
  }

  if (!serverAnalytics) {
    try {
      const u = await getAdminUsers();
      users = u.results || [];
    } catch {
      users = [];
    }
  }

  return {
    serverAnalytics,
    modelMetrics,
    articles,
    users,
    analyticsError,
    mockAnalytics: serverAnalytics ? null : MOCK_ANALYTICS,
  };
}

export function buildOverviewStatCards({ serverAnalytics, palette }) {
  if (!palette) return [];
  return buildDashboardStatCards(serverAnalytics, palette);
}

export function isModelMetricsUnavailable() {
  return modelMetricsUnavailable;
}

export function markModelMetricsUnavailable() {
  modelMetricsUnavailable = true;
}
