import {
  getAdminAnalytics,
  getAdminArticles,
  getAdminModelMetrics,
  getAdminUsers,
} from '../../api/adminApi';
import { MOCK_ANALYTICS, MOCK_KEYWORDS } from './mockAdminData';

/**
 * Same admin API bundle as mobile AdminScreen.loadData (overview slice).
 * Real data from Django `/api/admin/*`; mock analytics/keywords only when analytics API fails.
 */
export async function loadAdminOverview() {
  let serverAnalytics = null;
  let modelMetrics = null;
  let articles = [];
  let users = [];

  try {
    serverAnalytics = await getAdminAnalytics();
  } catch {
    serverAnalytics = null;
  }

  try {
    const res = await getAdminArticles({ page: 1, pageSize: 50, scope: 'all' });
    articles = res.results || [];
  } catch {
    articles = [];
  }

  try {
    modelMetrics = await getAdminModelMetrics();
  } catch {
    modelMetrics = null;
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
    keywords: MOCK_KEYWORDS,
    mockAnalytics: serverAnalytics ? null : MOCK_ANALYTICS,
  };
}

export function buildOverviewStatCards({ serverAnalytics, articles, users }) {
  if (serverAnalytics) {
    const pipelineKeyCount = Object.keys(serverAnalytics.raw_by_pipeline_status || {}).length;
    return [
      {
        label: 'Raw articles',
        value: String(serverAnalytics.raw_total ?? 0),
        path: '/admin/articles?scope=raw',
      },
      {
        label: 'Processed',
        value: String(serverAnalytics.processed_total ?? 0),
        path: '/admin/articles?scope=processed',
      },
      {
        label: 'In feed list',
        value: String(articles.length),
        path: '/admin/articles',
      },
      {
        label: 'Pipeline states',
        value: String(pipelineKeyCount),
        path: '/admin/dashboard',
      },
    ];
  }

  const active = users.filter((u) => u.is_active !== false).length;
  return [
    { label: 'Total Users', value: String(users.length), path: '/admin/users' },
    { label: 'Active Users', value: String(active), path: '/admin/users' },
    { label: 'Keywords (mock)', value: String(MOCK_KEYWORDS.length), path: '/admin/dashboard' },
    { label: 'Articles (mock)', value: '—', path: '/admin/articles' },
  ];
}
