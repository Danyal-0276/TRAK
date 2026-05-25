/**
 * Admin articles: pipeline status is the only list filter (no All/Raw/Processed tabs).
 */

export function getArticlesApiScope(pipelineFilter = '') {
  const pipe = String(pipelineFilter || '').toLowerCase();
  if (pipe === 'done' || pipe === 'completed' || pipe === 'processed') return 'processed';
  if (pipe === 'raw' || ['queue', 'pending', 'processing', 'failed'].includes(pipe)) return 'raw';
  return 'all';
}

export function parseArticleRouteParams(searchParams) {
  let pipe = String(searchParams?.get?.('pipeline') || searchParams?.pipeline || '').toLowerCase();

  if (!pipe) {
    const legacyScope = String(searchParams?.get?.('scope') || searchParams?.scope || '').toLowerCase();
    const legacyPipe = String(searchParams?.get?.('pipeline') || '').toLowerCase();
    if (legacyPipe === 'done' || legacyPipe === 'completed') pipe = 'done';
    else if (legacyPipe) pipe = legacyPipe;
    else if (legacyScope === 'processed') pipe = 'done';
    else if (legacyScope === 'raw') pipe = 'raw';
  }

  return {
    pipelineFilter: pipe,
    apiScope: getArticlesApiScope(pipe),
  };
}

export function filterArticlesByPipeline(articles, pipelineFilter) {
  const pipe = String(pipelineFilter || '').toLowerCase();
  const list = articles || [];

  if (!pipe) return list;
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
      (a.topic_keywords || []).some((k) => String(k).toLowerCase().includes(q))
  );
}
