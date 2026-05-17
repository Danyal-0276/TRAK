/** Normalize article payload before navigating to ArticleDetail. */
export function normalizeArticleForDetail(item) {
  if (!item || typeof item !== 'object') {
    return { id: '', title: 'Untitled', excerpt: '', content: '', fullContent: '' };
  }
  const id = String(item.id || item.article_id || item._id || '').trim();
  const excerpt = item.excerpt || item.summary || '';
  const fullContent =
    item.fullContent || item.full_content || item.content || '';
  return {
    ...item,
    id,
    article_id: id,
    title: item.title || 'Untitled',
    excerpt,
    summary: excerpt,
    content: fullContent,
    fullContent,
    canonical_url: item.canonical_url || item.url || '',
    url: item.url || item.canonical_url || '',
    readTime: item.readTime || 4,
    like_count: Number(item.like_count ?? item.upvotes ?? 0),
    dislike_count: Number(item.dislike_count ?? 0),
  };
}

export function buildArticleDetailParams(item) {
  const article = normalizeArticleForDetail(item);
  return {
    article,
    articleId: article.id,
  };
}
