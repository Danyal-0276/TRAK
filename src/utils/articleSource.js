/** Resolve display source for article cards (avoid generic "TRAK" placeholder). */
export function resolveArticleSource(item) {
  const raw = item?.source || item?.source_key || '';
  if (raw && String(raw).trim() && String(raw).toUpperCase() !== 'TRAK') {
    return String(raw).trim();
  }
  const url = item?.canonical_url || item?.url || '';
  if (url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./i, '');
      if (host) return host;
    } catch (_) {
      /* invalid url */
    }
  }
  const category = item?.category || item?.topic_keywords?.[0];
  if (category && String(category).toLowerCase() !== 'saved') {
    return String(category);
  }
  return 'News';
}
