/** Transform `/api/admin/analytics/` payload (aligned with web). */

import { CRED_NAMES, chartSeriesColor, credibilityColor, factCheckVerdictColor, pipelineColor } from './adminTheme';

export function isAnalyticsPayload(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    ('raw_total' in obj || 'pipeline_summary' in obj || 'raw_by_pipeline_status' in obj)
  );
}

function countByKey(items, keyFn) {
  const out = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!key || key === 'skipped') continue;
    const k = String(key);
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function hasKeys(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

function dayKeyFromIso(iso) {
  if (!iso) return null;
  const s = String(iso);
  return s.length >= 10 ? s.slice(0, 10) : null;
}

/** Build 14-day scrape/process series from Mongo article timestamps (fallback when analytics API omits activity). */
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
    if (article.scope !== 'raw') continue;
    const key = dayKeyFromIso(article.fetched_at);
    if (!key || !buckets[key]) continue;
    buckets[key].scraped += 1;
    const status = String(article.pipeline_status || '').toLowerCase();
    if (status === 'done') {
      buckets[key].processed += 1;
    }
  }
  return Object.keys(buckets)
    .sort()
    .map((date) => ({
      date,
      label: date.slice(5),
      scraped: buckets[date].scraped,
      processed: Math.min(buckets[date].processed, buckets[date].scraped),
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
  const ingestMap = Object.fromEntries(ingest.map((row) => [row.date, Number(row.count) || 0]));
  const allDates = [...new Set([...ingest.map((r) => r.date), ...processed.map((r) => r.date)])].sort();
  return allDates.map((date) => {
    const scraped = ingestMap[date] ?? 0;
    const done = procMap[date] ?? 0;
    return {
      date,
      label: String(date || '').slice(5),
      scraped,
      processed: Math.min(done, scraped),
    };
  });
}

function pipelineSummaryFromCounts(counts, rawTotal) {
  const pending = Number(counts.pending) || 0;
  const processing = Number(counts.processing) || 0;
  const done = Number(counts.done) || 0;
  const failed = Number(counts.failed) || 0;
  const queued = pending + processing;
  const finished = done + failed;
  const total = Number(rawTotal) || 0;
  return {
    pending,
    processing,
    done,
    failed,
    unknown: Number(counts.unknown) || 0,
    queued,
    completion_pct: total ? Math.round((100 * done) / total * 10) / 10 : 0,
    success_pct: finished ? Math.round((100 * done) / finished * 10) / 10 : 0,
  };
}

function connectionsSummaryFromList(connections = []) {
  const list = Array.isArray(connections) ? connections : [];
  const active = list.filter((c) => c.active !== false);
  return {
    total: list.length,
    active: active.length,
    sources: list.slice(0, 20).map((c) => ({
      slug: c.slug || c.id,
      name: c.name || c.slug,
      kind: c.kind || 'rss',
      active: c.active !== false,
      source_key: c.source_key || c.slug,
    })),
  };
}

/** Merge API snapshot with Mongo-backed article/user/connection data for KPI cards and charts. */
export function enrichAnalyticsSnapshot(serverSnapshot, articles = [], extras = {}) {
  const base = isAnalyticsPayload(serverSnapshot)
    ? { ...emptyAnalyticsSnapshot(), ...serverSnapshot }
    : { ...emptyAnalyticsSnapshot() };

  const list = Array.isArray(articles) ? articles : [];
  const rawList = list.filter((a) => a.scope === 'raw');
  const procList = list.filter((a) => a.scope === 'processed');

  const apiTotalsMissing =
    !Number(base.raw_total) && !Number(base.processed_total) && list.length > 0;

  if (apiTotalsMissing) {
    base.raw_total = rawList.length;
    base.processed_total = procList.length;
    base.raw_by_pipeline_status = countByKey(rawList, (a) => a.pipeline_status || 'unknown');
    base.pipeline_summary = pipelineSummaryFromCounts(base.raw_by_pipeline_status, base.raw_total);
    const credCounts = countByKey(procList, (a) => a.credibility_label ?? a.credibility_label_name ?? 'none');
    base.processed_by_credibility_label = credCounts;
    base.processed_by_credibility_label_named = Object.fromEntries(
      Object.entries(credCounts).map(([k, v]) => {
        const label = CRED_NAMES[String(k)] || String(k);
        return [label, v];
      })
    );
  }

  if (!hasKeys(base.fact_check_by_verdict) && procList.length) {
    base.fact_check_by_verdict = countByKey(procList, (a) => a.fact_check_verdict || 'unknown');
  }

  if (!hasKeys(base.raw_by_source_key) && rawList.length) {
    base.raw_by_source_key = countByKey(rawList, (a) => a.source_key || a.source || a.author);
  }

  if (!hasKeys(base.processed_by_source_key) && procList.length) {
    base.processed_by_source_key = countByKey(procList, (a) => a.source_key || a.source || a.author);
  }

  const users = extras.users;
  if (Array.isArray(users) && users.length && !Number(base.users_total)) {
    base.users_total = users.length;
    base.users_active = users.filter((u) => u.status === 'active' || u.is_active !== false).length;
  } else if (Number(extras.usersTotal)) {
    base.users_total = Number(extras.usersTotal);
    base.users_active = Number(extras.usersActive) || 0;
  }

  const connList = extras.connections;
  if (Array.isArray(connList) && connList.length) {
    const conn = connectionsSummaryFromList(connList);
    if (!Number(base.scrape_connections?.total)) {
      base.scrape_connections = conn;
    }
  }

  if (!base.pipeline_summary?.queued && hasKeys(base.raw_by_pipeline_status)) {
    base.pipeline_summary = pipelineSummaryFromCounts(
      base.raw_by_pipeline_status,
      base.raw_total || rawList.length
    );
  }

  const mergedActivity = mergeActivityDailyFromApiFields(base);
  if (mergedActivity.length && mergedActivity.some((r) => (r.scraped || 0) + (r.processed || 0) > 0)) {
    base.activity_daily = mergedActivity;
  } else if (list.length) {
    base.activity_daily = buildActivityDailyFromArticles(list);
  }

  return base;
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
  return Object.entries(raw)
    .map(([name, value], i) => ({
      key: String(name),
      name: String(name).replace(/_/g, ' '),
      value: Number(value) || 0,
      fill: factCheckVerdictColor(palette, name, i),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function sourceBarData(snapshot, field = 'raw_by_source_key', limit = 8, palette = null) {
  const raw = snapshot?.[field] || {};
  return Object.entries(raw)
    .map(([name, value], i) => ({
      name: String(name),
      count: Number(value) || 0,
      fill: palette ? chartSeriesColor(palette, i) : undefined,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Rows for AdminHorizontalBarList (fact-check + sources). */
export function barListRows(entries, palette, { nameFormatter, colorPicker } = {}) {
  const fills = (palette?.chart?.series || [
    palette?.chart?.primary,
    palette?.chart?.secondary,
    palette?.chart?.info,
    palette?.chart?.scraped,
    palette?.chart?.processed,
  ]).filter(Boolean);

  return entries.map(([name, value], i) => ({
    key: String(name),
    name: nameFormatter ? nameFormatter(name) : String(name),
    value: Number(value) || 0,
    fill: colorPicker ? colorPicker(name, i) : fills[i % fills.length] || palette?.primary,
  }));
}

export function activityAreaData(snapshot) {
  return (snapshot?.activity_daily || []).map((row) => ({
    name: row.label || row.date?.slice(5) || '',
    date: row.date || '',
    scraped: row.scraped ?? 0,
    processed: row.processed ?? 0,
  }));
}

/** Compact axis label (e.g. "06-03" → "6/3") so dates fit on narrow screens. */
export function formatActivityAxisLabel(label) {
  const raw = String(label || '').trim();
  if (!raw) return '';
  const parts = raw.split('-');
  if (parts.length === 2) {
    const month = Number(parts[0]);
    const day = Number(parts[1]);
    if (Number.isFinite(month) && Number.isFinite(day)) {
      return `${month}/${day}`;
    }
  }
  return raw.length > 6 ? raw.slice(0, 6) : raw;
}

/**
 * Pick x-axis ticks that fit the chart width without overlapping.
 * Always shows first and last day; fills in between at a computed step.
 */
export function buildActivityChartAxisLabels(rows, { chartWidth = 320, minPointWidth = 48 } = {}) {
  const total = rows?.length || 0;
  if (!total) return [];
  const maxTicks = Math.max(5, Math.min(7, Math.floor(chartWidth / minPointWidth)));
  const cappedTicks = Math.min(maxTicks, total);
  const step = total <= cappedTicks ? 1 : Math.ceil((total - 1) / (cappedTicks - 1));
  return rows.map((row, i) => {
    const show = i === 0 || i === total - 1 || i % step === 0;
    if (!show) return '';
    return formatActivityAxisLabel(row.name || row.label || String(row.date || '').slice(5));
  });
}

export function feedbackStatusPieData(snapshot, palette) {
  const stats = snapshot?.feedback_stats;
  if (!stats || !palette) return [];
  return [
    { name: 'Pending', value: Number(stats.pending) || 0, fill: palette.warning },
    { name: 'Reviewed', value: Number(stats.reviewed) || 0, fill: palette.success },
    { name: 'Dismissed', value: Number(stats.dismissed) || 0, fill: palette.textTertiary },
  ].filter((d) => d.value > 0);
}

export function feedbackCategoryBarData(snapshot, limit = 8) {
  const byCat = snapshot?.feedback_stats?.by_category || {};
  return Object.entries(byCat)
    .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

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
    fact_check_by_verdict: {},
    raw_by_source_key: {},
    processed_by_source_key: {},
    activity_daily: [],
    users_total: 0,
    users_active: 0,
  };
}

export function buildDashboardStatCards(snapshot, palette) {
  if (!palette) return [];
  const data = snapshot || emptyAnalyticsSnapshot();
  const ps = data.pipeline_summary || {};
  const conn = data.scrape_connections || {};
  const a = palette.statAccent;

  return [
    { key: 'raw', label: 'Raw articles', value: String(data.raw_total ?? 0), accent: a.raw, hint: 'All scraped raw articles' },
    { key: 'processed', label: 'Processed', value: String(data.processed_total ?? 0), accent: a.processed, hint: 'Articles ready in the feed' },
    { key: 'queue', label: 'In queue', value: String(ps.queued ?? 0), accent: a.queue, hint: `Pending ${ps.pending ?? 0} · processing ${ps.processing ?? 0}` },
    { key: 'failed', label: 'Failed', value: String(ps.failed ?? 0), accent: a.failed, hint: 'Pipeline errors' },
    { key: 'completion', label: 'Completion', value: `${ps.completion_pct ?? 0}%`, accent: a.completion, hint: 'Raw articles marked done' },
    { key: 'sources', label: 'Sources', value: `${conn.active ?? 0}/${conn.total ?? 0}`, accent: a.sources, hint: 'Manage scrape connections' },
    { key: 'users', label: 'Users', value: String(data.users_active ?? 0), accent: a.users, hint: `${data.users_total ?? 0} accounts total` },
    { key: 'credibility', label: 'Processed feed', value: String(data.processed_total ?? 0), accent: a.credibility, hint: 'Review credibility on processed articles' },
  ];
}

export const KPI_TAB_NAV = {
  raw: { tab: 'articles', pipeline: 'raw' },
  processed: { tab: 'articles', pipeline: 'done' },
  queue: { tab: 'articles', pipeline: 'queue' },
  failed: { tab: 'articles', pipeline: 'failed' },
  completion: { tab: 'articles', pipeline: 'done' },
  sources: { tab: 'dashboard', pipeline: '', scrollKey: 'sources' },
  users: { tab: 'users', pipeline: '' },
  credibility: { tab: 'articles', pipeline: 'done' },
};
