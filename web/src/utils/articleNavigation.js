const CARD_SUMMARY_FALLBACK_MAX = 500;

/** Text shown on feed cards: pipeline summary, or a short body snippet. */
export function getCardSummaryText(item, maxLen = CARD_SUMMARY_FALLBACK_MAX) {
  if (!item || typeof item !== 'object') return '';
  const summary = String(item.summary || item.excerpt || item.description || '').trim();
  if (summary) return summary;
  const body = String(
    item.full_content || item.fullContent || item.content || ''
  ).trim();
  if (!body) return '';
  if (body.length <= maxLen) return body;
  const cut = body.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.trim()}…`;
}

/** Normalize article payload for detail views (cards vs full body). */
export function normalizeArticleForDetail(item) {
  if (!item || typeof item !== 'object') {
    return { id: '', title: 'Untitled', excerpt: '', content: '', fullContent: '' };
  }
  const id = String(item.id || item.article_id || item._id || '').trim();
  const excerpt = item.excerpt || item.summary || item.description || '';
  const fullContent =
    item.fullContent || item.full_content || item.content || '';
  return {
    ...item,
    id,
    article_id: id,
    title: item.title || 'Untitled',
    excerpt,
    summary: excerpt,
    description: excerpt,
    content: fullContent,
    fullContent,
    canonical_url: item.canonical_url || item.url || '',
    url: item.url || item.canonical_url || '',
    readTime: item.readTime || 4,
    like_count: Number(item.like_count ?? item.upvotes ?? 0),
    dislike_count: Number(item.dislike_count ?? 0),
  };
}
