/** Transform `/api/admin/analytics/` payload for Recharts (theme-aware). */

import { CRED_NAMES, credibilityColor, pipelineColor } from './adminTheme';

export function isAnalyticsPayload(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    ('raw_total' in obj || 'pipeline_summary' in obj || 'raw_by_pipeline_status' in obj)
  );
}

export function pipelinePieData(snapshot, palette) {
  if (!snapshot || !palette) return [];
  const raw = snapshot.raw_by_pipeline_status || {};
  return Object.entries(raw)
    .map(([name, value]) => ({
      name: String(name),
      value: Number(value) || 0,
      fill: pipelineColor(palette, name),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function credibilityPieData(snapshot, palette) {
  if (!snapshot || !palette) return [];
  const named = snapshot.processed_by_credibility_label_named;
  const raw = named || snapshot?.processed_by_credibility_label || {};
  return Object.entries(raw)
    .map(([key, value]) => {
      const label = named ? key : CRED_NAMES[key] || key;
      return {
        name: label,
        value: Number(value) || 0,
        fill: credibilityColor(palette, label) || credibilityColor(palette, key),
      };
    })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function factCheckBarData(snapshot, palette) {
  if (!snapshot || !palette) return [];
  const raw = snapshot.fact_check_by_verdict || {};
  const fills = (palette.chart?.series || [
    palette.chart?.primary,
    palette.chart?.secondary,
    palette.chart?.info,
    palette.chart?.scraped,
    palette.chart?.processed,
  ]).filter(Boolean);
  return Object.entries(raw)
    .map(([name, value], i) => ({
      name: String(name).replace(/_/g, ' '),
      value: Number(value) || 0,
      fill: fills[i % fills.length],
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function sourceBarData(snapshot, field = 'raw_by_source_key', limit = 8) {
  const raw = snapshot?.[field] || {};
  return Object.entries(raw)
    .map(([name, value]) => ({ name: String(name), count: Number(value) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function activityAreaData(snapshot) {
  return (snapshot?.activity_daily || []).map((row) => ({
    name: row.label || row.date?.slice(5) || '',
    scraped: row.scraped ?? 0,
    processed: row.processed ?? 0,
  }));
}

export function feedbackStatusPieData(snapshot, palette) {
  const stats = snapshot?.feedback_stats;
  if (!stats || !palette) return [];
  const items = [
    { name: 'Pending', value: Number(stats.pending) || 0, fill: palette.warning },
    { name: 'Reviewed', value: Number(stats.reviewed) || 0, fill: palette.success },
    { name: 'Dismissed', value: Number(stats.dismissed) || 0, fill: palette.textTertiary },
  ];
  return items.filter((d) => d.value > 0);
}

export function feedbackCategoryBarData(snapshot, limit = 8) {
  const byCat = snapshot?.feedback_stats?.by_category || {};
  return Object.entries(byCat)
    .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Fallback when analytics API fails so KPI cards still render with correct links. */
export function emptyAnalyticsSnapshot() {
  return {
    raw_total: 0,
    processed_total: 0,
    pipeline_summary: {
      pending: 0,
      processing: 0,
      done: 0,
      failed: 0,
      queued: 0,
      completion_pct: 0,
    },
    scrape_connections: { total: 0, active: 0, sources: [] },
    raw_by_pipeline_status: {},
    processed_by_credibility_label: {},
    activity_daily: [],
    ingest_daily: [],
    processed_daily: [],
    fact_check_by_verdict: {},
    raw_by_source_key: {},
    processed_by_source_key: {},
    users_total: 0,
    users_active: 0,
  };
}

function hasKeys(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

function dayKeyFromIso(iso) {
  if (!iso) return null;
  const s = String(iso);
  return s.length >= 10 ? s.slice(0, 10) : null;
}

export function buildActivityDailyFromArticles(articles = [], days = 14) {
  const buckets = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { scraped: 0, processed: 0 };
  }
  for (const article of articles) {
    if (article.scope === 'raw') {
      const key = dayKeyFromIso(article.fetched_at);
      if (key && buckets[key]) buckets[key].scraped += 1;
    }
    if (article.scope === 'processed') {
      const key = dayKeyFromIso(article.processed_at || article.fetched_at);
      if (key && buckets[key]) buckets[key].processed += 1;
    }
  }
  return Object.keys(buckets)
    .sort()
    .map((date) => ({
      date,
      label: date.slice(5),
      scraped: buckets[date].scraped,
      processed: buckets[date].processed,
    }));
}

function mergeActivityDailyFromApiFields(base) {
  if (hasKeys(base.activity_daily) && base.activity_daily.some((r) => (r.scraped || 0) + (r.processed || 0) > 0)) {
    return base.activity_daily;
  }
  const ingest = base.ingest_daily || [];
  const processed = base.processed_daily || [];
  if (!ingest.length && !processed.length) return base.activity_daily || [];
  const procMap = Object.fromEntries(processed.map((d) => [d.date, Number(d.count) || 0]));
  return ingest.map((row) => ({
    date: row.date,
    label: row.label || String(row.date || '').slice(5),
    scraped: Number(row.count) || 0,
    processed: procMap[row.date] ?? 0,
  }));
}

/** Merge analytics API snapshot with article timestamps for activity charts. */
export function enrichAnalyticsSnapshot(serverSnapshot, articles = []) {
  const base = isAnalyticsPayload(serverSnapshot)
    ? { ...emptyAnalyticsSnapshot(), ...serverSnapshot }
    : { ...emptyAnalyticsSnapshot() };

  const list = Array.isArray(articles) ? articles : [];
  const mergedActivity = mergeActivityDailyFromApiFields(base);
  if (mergedActivity.length && mergedActivity.some((r) => (r.scraped || 0) + (r.processed || 0) > 0)) {
    base.activity_daily = mergedActivity;
  } else if (list.length) {
    base.activity_daily = buildActivityDailyFromArticles(list);
  }

  return base;
}

export function buildDashboardStatCards(snapshot, palette) {
  if (!palette) return [];
  const data = snapshot || emptyAnalyticsSnapshot();
  const ps = data.pipeline_summary || {};
  const conn = data.scrape_connections || {};
  const a = palette.statAccent;

  return [
    {
      key: 'raw',
      label: 'Raw articles',
      value: String(data.raw_total ?? 0),
      path: '/admin/articles?pipeline=raw',
      accent: a.raw,
      hint: 'All scraped raw articles',
    },
    {
      key: 'processed',
      label: 'Processed',
      value: String(data.processed_total ?? 0),
      path: '/admin/articles?pipeline=done',
      accent: a.processed,
      hint: 'Articles ready in the feed',
    },
    {
      key: 'queue',
      label: 'In queue',
      value: String(ps.queued ?? 0),
      path: '/admin/articles?pipeline=queue',
      accent: a.queue,
      hint: `Pending ${ps.pending ?? 0} · active ${ps.active_processing ?? ps.processing ?? 0}`,
    },
    {
      key: 'failed',
      label: 'Failed',
      value: String(ps.failed ?? 0),
      path: '/admin/articles?pipeline=failed',
      accent: a.failed,
      hint: 'Pipeline errors — re-run from dashboard',
    },
    {
      key: 'completion',
      label: 'Completion',
      value: `${ps.completion_pct ?? 0}%`,
      path: '/admin/articles?pipeline=done',
      accent: a.completion,
      hint: 'Raw articles marked done',
    },
    {
      key: 'sources',
      label: 'Sources',
      value: `${conn.active ?? 0}/${conn.total ?? 0}`,
      path: '/admin/dashboard#dashboard-sources',
      accent: a.sources,
      hint: 'Manage scrape connections',
    },
    {
      key: 'users',
      label: 'Users',
      value: String(data.users_active ?? 0),
      path: '/admin/users',
      accent: a.users,
      hint: `${data.users_total ?? 0} accounts total`,
    },
    {
      key: 'credibility',
      label: 'Processed feed',
      value: String(data.processed_total ?? 0),
      path: '/admin/articles?pipeline=done',
      accent: a.credibility,
      hint: 'Review credibility on processed articles',
    },
    {
      key: 'feedback',
      label: 'Pending feedback',
      value: String(data.feedback_stats?.pending ?? 0),
      path: '/admin/feedback',
      accent: palette.warning,
      hint: `${data.feedback_stats?.total ?? 0} total submissions`,
    },
  ];
}
