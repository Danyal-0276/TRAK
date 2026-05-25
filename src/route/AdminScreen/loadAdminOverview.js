import {
  getAdminAnalytics,
  getAdminArticles,
  getAdminModelMetrics,
  getAdminSettings,
  getAdminUsers,
} from '../../api/adminApi';
import { normAdminConnections } from '../../utils/adminLists';
import { buildDashboardStatCards, isAnalyticsPayload } from './dashboardChartUtils';

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
          : 'Analytics API returned an unexpected response. Sign in as admin and use a backend with MongoDB.';
      if (requireAnalytics) throw new Error(analyticsError);
    }
  } catch (err) {
    if (requireAnalytics) throw err;
    analyticsError = err?.message || 'Could not load analytics.';
    serverAnalytics = null;
  }

  try {
    const res = await getAdminArticles({ page: 1, pageSize: 200, scope: 'all' });
    articles = res.results || [];
  } catch {
    articles = [];
  }

  try {
    modelMetrics = await getAdminModelMetrics();
  } catch {
    modelMetrics = null;
  }

  try {
    const u = await getAdminUsers({ role: 'user' });
    users = (u.results || []).map((row) => ({
      id: row.id,
      status: row.is_active ? 'active' : 'inactive',
      is_active: row.is_active,
    }));
  } catch {
    users = [];
  }

  let connections = [];
  try {
    const settings = await getAdminSettings();
    connections = normAdminConnections(settings.connections || []);
  } catch {
    connections = [];
  }

  return { serverAnalytics, modelMetrics, articles, users, connections, analyticsError };
}

export function buildOverviewStatCards({ serverAnalytics, palette }) {
  if (!palette) return [];
  return buildDashboardStatCards(serverAnalytics, palette);
}
