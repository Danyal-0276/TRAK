import { sanitizeArticleBody, sanitizeArticleSummary } from './articleTextSanitize';

/** Max characters sent to TTS (backend may chunk further). */
export const LISTEN_TEXT_MAX = 40000;

function trimToMax(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** Full article text for listen (title + body; summary only if no body). */
export function getArticleListenText(item, maxLen = LISTEN_TEXT_MAX) {
  if (!item || typeof item !== 'object') return '';

  const title = String(item.title || '').trim();
  const body = String(item.fullContent || item.full_content || item.content || '')
    .replace(/\s+/g, ' ')
    .trim();
  const summary = String(item.summary || item.excerpt || item.description || '')
    .replace(/\s+/g, ' ')
    .trim();

  let text = body || summary;
  if (title && text) text = `${title}. ${text}`;
  else if (title) text = title;

  return trimToMax(text.trim(), maxLen);
}

/** Normalize article payload before navigating to ArticleDetail. */
export function normalizeArticleForDetail(item) {
  if (!item || typeof item !== 'object') {
    return { id: '', title: 'Untitled', excerpt: '', content: '', fullContent: '' };
  }
  const id = String(item.id || item.article_id || item._id || '').trim();
  const title = item.title || 'Untitled';
  const rawBody = item.fullContent || item.full_content || item.content || '';
  const fullContent = sanitizeArticleBody(rawBody, { title });
  const excerpt = sanitizeArticleSummary(item.excerpt || item.summary || '', {
    title,
    body: fullContent,
  });
  return {
    ...item,
    id,
    article_id: id,
    title,
    excerpt,
    summary: excerpt,
    content: fullContent,
    fullContent,
    image_url: item.image_url || item.image || '',
    ai_summary: item.ai_summary || item.summary || excerpt,
    credibility_label: item.credibility_label ?? item.credibility?.label_code,
    credibility_label_name: item.credibility_label_name || item.credibilityLabel || item.credibility?.label,
    credibility_score: item.credibility_score ?? item.credibility?.score,
    credibility_probs: item.credibility_probs || item.credibility?.probs,
    fact_check_verdict: item.fact_check_verdict,
    scope: item.scope || 'processed',
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
