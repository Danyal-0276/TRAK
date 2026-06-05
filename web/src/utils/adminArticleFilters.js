/**
 * Admin articles: processed feed vs raw pipeline filters.
 */

export const NEEDS_REVIEW_HELP =
  'Feed shows processed articles only. Fake / Suspicious filters show all articles with that credibility label. Needs review = Fake or Suspicious with fact-check, not yet approved. Pipeline filters show raw scraper rows.';

const FACT_CHECK_SKIP = new Set([
  '',
  'skipped',
  'disabled',
  'no_api_key',
  'empty_query',
  'api_error',
  'no_hits',
]);

export const FEED_FILTERS = [
  { id: '', label: 'All processed' },
  { id: 'fake', label: 'Fake news' },
  { id: 'suspicious', label: 'Suspicious' },
  { id: 'review', label: 'Needs review' },
  { id: 'approved', label: 'Approved' },
];

export const PIPELINE_FILTERS = [
  { id: 'queue', label: 'Queue' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'failed', label: 'Failed' },
];

export function factCheckRan(article) {
  const verdict = String(article?.fact_check_verdict || '').trim().toLowerCase();
  return Boolean(verdict) && !FACT_CHECK_SKIP.has(verdict);
}

export function isFakeOrSuspicious(article) {
  const code = article?.credibility_label;
  if (code === 1 || code === 2 || code === '1' || code === '2') return true;
  const name = String(article?.credibility_label_name || '').toLowerCase();
  return name.includes('fake') || name.includes('suspicious');
}

export function isFakeArticle(article) {
  const code = article?.credibility_label;
  if (code === 1 || code === '1') return true;
  return String(article?.credibility_label_name || '').toLowerCase().includes('fake');
}

export function isSuspiciousArticle(article) {
  const code = article?.credibility_label;
  if (code === 2 || code === '2') return true;
  return String(article?.credibility_label_name || '').toLowerCase().includes('suspicious');
}

export function getArticlesApiScope(pipelineFilter = '') {
  const pipe = String(pipelineFilter || '').toLowerCase();
  if (pipe === 'raw' || ['queue', 'pending', 'processing', 'failed'].includes(pipe)) return 'raw';
  if (['fake', 'suspicious', 'review', 'approved'].includes(pipe)) return 'processed';
  return 'processed';
}

export function getArticlesFetchParams(pipelineFilter = '') {
  const pipe = String(pipelineFilter || '').toLowerCase();
  const scope = getArticlesApiScope(pipe);
  const serverPipeline = ['queue', 'pending', 'processing', 'failed'].includes(pipe) ? pipe : '';
  let serverModeration = '';
  let credibilityLabel = '';
  if (pipe === 'review' || pipe === 'needs_review' || pipe === 'needs-review') {
    serverModeration = 'review';
  } else if (pipe === 'approved') {
    serverModeration = 'approved';
  } else if (pipe === 'fake') {
    credibilityLabel = '1';
  } else if (pipe === 'suspicious') {
    credibilityLabel = '2';
  }
  return { scope, pipelineStatus: serverPipeline, moderationStatus: serverModeration, credibilityLabel };
}

export function articleNeedsReview(article) {
  if (article?.scope !== 'processed' && article?.category !== 'Processed') return false;
  const ms = String(article?.moderation_status || '').toLowerCase();
  if (ms === 'approved' || ms === 'rejected') return false;
  return isFakeOrSuspicious(article) && factCheckRan(article);
}

export function parseArticleRouteParams(searchParams) {
  let pipe = String(searchParams?.get?.('pipeline') || searchParams?.pipeline || '').toLowerCase();

  if (!pipe) {
    const legacyModeration = String(
      searchParams?.get?.('moderation') || searchParams?.moderation || ''
    ).toLowerCase();
    if (legacyModeration === 'review' || legacyModeration === 'needs_review') pipe = 'review';
    else if (legacyModeration === 'approved') pipe = 'approved';
  }

  if (!pipe) {
    const legacyScope = String(searchParams?.get?.('scope') || searchParams?.scope || '').toLowerCase();
    const legacyPipe = String(searchParams?.get?.('pipeline') || '').toLowerCase();
    if (legacyPipe === 'done' || legacyPipe === 'completed' || legacyPipe === 'processed') pipe = '';
    else if (legacyPipe) pipe = legacyPipe;
    else if (legacyScope === 'raw') pipe = 'queue';
    else if (legacyScope === 'processed') pipe = '';
  }

  return {
    pipelineFilter: pipe,
    apiScope: getArticlesApiScope(pipe),
  };
}

export function filterArticlesByPipeline(articles, pipelineFilter) {
  const pipe = String(pipelineFilter || '').toLowerCase();
  const list = articles || [];

  if (!pipe) return list.filter((a) => a.scope === 'processed');
  if (pipe === 'fake') {
    return list.filter((a) => a.scope === 'processed' && isFakeArticle(a));
  }
  if (pipe === 'suspicious') {
    return list.filter((a) => a.scope === 'processed' && isSuspiciousArticle(a));
  }
  if (pipe === 'review' || pipe === 'needs_review' || pipe === 'needs-review') {
    return list.filter(articleNeedsReview);
  }
  if (pipe === 'approved') {
    return list.filter(
      (a) =>
        a.scope === 'processed' &&
        String(a.moderation_status || '').toLowerCase() === 'approved'
    );
  }
  if (pipe === 'done' || pipe === 'completed' || pipe === 'processed') {
    return list.filter((a) => a.scope === 'processed');
  }
  if (pipe === 'raw') return list.filter((a) => a.scope === 'raw');

  return list.filter((a) => {
    if (a.scope !== 'raw') return false;
    const ps = String(a.pipeline_status || '').toLowerCase();
    if (pipe === 'queue') return ps === 'pending' || ps === 'processing';
    return ps === pipe;
  });
}

export function filterArticlesForDisplay(articles, pipelineFilter, searchQuery = '') {
  let list = filterArticlesByPipeline(articles, pipelineFilter);

  const q = String(searchQuery || '').toLowerCase().trim();
  if (!q) return list;

  return list.filter(
    (a) =>
      a.title?.toLowerCase().includes(q) ||
      (a.source || a.source_key || '').toLowerCase().includes(q) ||
      (a.author || '').toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      String(a.credibility_label ?? '').toLowerCase().includes(q) ||
      String(a.credibility_label_name ?? '').toLowerCase().includes(q) ||
      String(a.fact_check_verdict ?? '').toLowerCase().includes(q) ||
      String(a.pipeline_status ?? '').toLowerCase().includes(q) ||
      String(a.moderation_status ?? '').toLowerCase().includes(q) ||
      (a.topic_keywords || []).some((k) => String(k).toLowerCase().includes(q))
  );
}

export function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString();
}

const FILTER_COUNT_LABELS = {
  queue: 'in queue',
  pending: 'pending',
  processing: 'processing',
  failed: 'failed',
  approved: 'approved',
};

/** Summary line + stat pills for the articles page header. */
export function buildArticleCountDisplay({ counts, pipelineFilter, displayedCount, searchQuery }) {
  const uniqueTotal = counts?.total_unique ?? counts?.total_all ?? null;
  const processedTotal = counts?.processed_total ?? null;
  const rawTotal = counts?.raw_total ?? null;
  const filteredTotal = counts?.filtered_total ?? null;
  const needsReview = counts?.needs_review ?? null;
  const autoApproved = counts?.auto_approved ?? counts?.moderation_approved ?? null;
  const showing = displayedCount ?? counts?.returned ?? 0;
  const filter = String(pipelineFilter || '').toLowerCase();
  const hasSearch = Boolean(String(searchQuery || '').trim());
  const isPipeline = ['queue', 'pending', 'processing', 'failed', 'raw'].includes(filter);

  let detail = '';
  if (hasSearch) {
    detail = `${formatCount(showing)} result${showing === 1 ? '' : 's'} matching search`;
    if (filteredTotal != null && filteredTotal !== showing) {
      detail += ` · ${formatCount(filteredTotal)} in current filter`;
    }
  } else if (!filter) {
    if (filteredTotal != null && filteredTotal > showing) {
      detail = `Showing ${formatCount(showing)} of ${formatCount(filteredTotal)} processed articles`;
    } else {
      detail = `${formatCount(filteredTotal ?? processedTotal ?? showing)} processed article${(filteredTotal ?? processedTotal ?? showing) === 1 ? '' : 's'}`;
    }
    if (autoApproved != null) {
      detail += ` · ${formatCount(autoApproved)} auto-approved real`;
    }
    if (needsReview != null) {
      detail += ` · ${formatCount(needsReview)} need review`;
    }
  } else if (filter === 'fake') {
    detail = `${formatCount(filteredTotal ?? showing)} fake news article${(filteredTotal ?? showing) === 1 ? '' : 's'}`;
  } else if (filter === 'suspicious') {
    detail = `${formatCount(filteredTotal ?? showing)} suspicious article${(filteredTotal ?? showing) === 1 ? '' : 's'}`;
  } else if (filter === 'review' || filter === 'needs_review') {
    const n = needsReview ?? filteredTotal ?? showing;
    if (n > showing) {
      detail = `Showing ${formatCount(showing)} of ${formatCount(n)} fake/suspicious fact-checked articles`;
    } else {
      detail = `${formatCount(n)} fake/suspicious fact-checked article${n === 1 ? '' : 's'} need review`;
    }
  } else if (filter === 'approved') {
    detail = `${formatCount(filteredTotal ?? showing)} approved processed articles`;
  } else if (isPipeline) {
    const label = FILTER_COUNT_LABELS[filter] || filter;
    const n = filteredTotal ?? showing;
    detail =
      n > showing
        ? `Showing ${formatCount(showing)} of ${formatCount(n)} raw ${label}`
        : `${formatCount(n)} raw ${label}`;
    if (processedTotal != null) {
      detail += ` · ${formatCount(processedTotal)} processed (feed)`;
    }
  } else {
    const label = FILTER_COUNT_LABELS[filter] || filter;
    const n = filteredTotal ?? showing;
    detail = n > showing ? `Showing ${formatCount(showing)} of ${formatCount(n)} ${label}` : `${formatCount(n)} ${label}`;
  }

  const pills = [
    {
      key: 'unique',
      label: 'Unique stories',
      value: formatCount(uniqueTotal),
      active: !filter && !hasSearch,
    },
    {
      key: 'processed',
      label: 'Processed',
      value: formatCount(processedTotal),
      active: !filter && !hasSearch,
    },
    {
      key: 'review',
      label: 'Need review',
      value: formatCount(needsReview),
      active: filter === 'review' || filter === 'needs_review',
    },
  ];

  if (filteredTotal != null && filter && !hasSearch) {
    pills.unshift({
      key: 'filtered',
      label: 'This filter',
      value: formatCount(filteredTotal),
      active: true,
    });
  }

  return { detail, pills, totalAll: uniqueTotal, filteredTotal, needsReview, showing };
}
