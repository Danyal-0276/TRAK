import { getUserArticleDetail } from './Service/api';
import { mapApiItem } from './loadFeed';
import { filterRealFeedItems } from './feedRealOnly';

/** Load full article cards from bookmark or reaction list rows. */
export async function loadArticlesFromRows(rows = []) {
  const detailed = await Promise.all(
    rows.map(async (row) => {
      const aid = String(row.article_id ?? row.id ?? '').trim();
      if (!aid) return null;
      try {
        const full = await getUserArticleDetail(aid);
        const mapped = mapApiItem({ ...full, id: aid });
        const likes = Number(full.like_count ?? full.upvotes ?? 0);
        const dislikes = Number(full.dislike_count ?? 0);
        return {
          ...mapped,
          id: aid,
          description: mapped.excerpt || mapped.summary || '',
          excerpt: mapped.excerpt || mapped.summary || '',
          content: mapped.content || mapped.fullContent || '',
          fullContent: mapped.fullContent || mapped.content || '',
          category: full.topic_keywords?.[0] || mapped.category || 'News',
          time: full.published_at
            ? new Date(full.published_at).toLocaleString()
            : (row.created_at ? new Date(row.created_at).toLocaleString() : mapped.time || 'Recently'),
          like_count: likes,
          dislike_count: dislikes,
          upvotes: likes,
          verified: full.credibility?.label === 'real',
          trending: Boolean(full.topic_keywords?.length),
          image: full.image || full.image_url || mapped.image,
        };
      } catch {
        return {
          id: aid,
          title: row.title || 'Article',
          source: 'TRAK',
          excerpt: '',
          description: '',
          content: '',
          canonical_url: row.url || '',
          category: 'News',
          time: row.created_at ? new Date(row.created_at).toLocaleString() : 'Recently',
          like_count: 0,
          dislike_count: 0,
          upvotes: 0,
        };
      }
    })
  );
  return filterRealFeedItems(detailed.filter(Boolean));
}
