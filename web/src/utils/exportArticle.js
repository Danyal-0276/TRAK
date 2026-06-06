/** Build a JSON export payload for a single article card / detail row. */
export function articleExportPayload(item) {
  return {
    id: item?.id,
    title: item?.title,
    source: item?.source,
    category: item?.category,
    url: item?.canonical_url || item?.url,
    excerpt: item?.excerpt || item?.description,
    summary: item?.summary,
    topic_keywords: item?.topic_keywords,
    credibility: item?.credibility || item?.credibilityLabel,
    published_at: item?.published_at || item?.time,
  };
}

/** Download one article as a JSON file (web). */
export function downloadArticleJson(item) {
  const row = articleExportPayload(item);
  const safeId = item?.id != null ? String(item.id) : 'article';
  const blob = new Blob([JSON.stringify(row, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `trak-article-${safeId}-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
