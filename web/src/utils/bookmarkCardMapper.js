import { mapApiItem } from './loadFeed';

/** Fast card from bookmark list row — no per-article API call. */
export function bookmarkRowToCard(row) {
  const aid = String(row.article_id ?? '').trim();
  return {
    id: aid,
    title: row.title || 'Saved article',
    source: row.source || 'TRAK',
    excerpt: row.excerpt || '',
    description: row.excerpt || '',
    summary: row.excerpt || '',
    content: '',
    fullContent: '',
    canonical_url: row.url || '',
    category: 'Saved',
    time: row.created_at ? new Date(row.created_at).toLocaleString() : 'Recently',
    like_count: 0,
    dislike_count: 0,
    upvotes: 0,
    votes: 0,
    verified: false,
    trending: false,
  };
}

export function articleDetailToCard(full, row) {
  const aid = String(row?.article_id ?? full?.id ?? '').trim();
  const mapped = mapApiItem({ ...full, id: aid });
  const likes = Number(full.like_count ?? full.upvotes ?? 0);
  const dislikes = Number(full.dislike_count ?? 0);
  return {
    ...mapped,
    id: aid,
    description: mapped.excerpt || mapped.summary || '',
    excerpt: mapped.excerpt || mapped.summary || '',
    summary: mapped.summary || mapped.excerpt || '',
    content: mapped.content || mapped.fullContent || '',
    fullContent: mapped.fullContent || mapped.content || '',
    category: full.topic_keywords?.[0] || mapped.category || 'Saved',
    time: full.published_at
      ? new Date(full.published_at).toLocaleString()
      : row?.created_at
        ? new Date(row.created_at).toLocaleString()
        : mapped.time || 'Recently',
    like_count: likes,
    dislike_count: dislikes,
    upvotes: likes,
    verified: full.credibility?.label === 'real',
    trending: Boolean(full.topic_keywords?.length),
    image: full.image || full.image_url || mapped.image,
  };
}
