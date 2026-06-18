import { getUserArticleDetail, listBookmarks } from './Service/api';
import { mapApiItem } from './loadFeed';
import { getCardSummaryText } from './articleNavigation';
import { resolveArticleImageUrl } from './articleMedia';
import { getReactionMap } from './reactionsStorage';
import { getRegisteredVote } from './articleVoteController';
import { toBookmarkCard } from './articleBookmarkController';

function mapBookmarkRow(row, full, reactionMap) {
  const aid = String(row?.article_id ?? full?.id ?? '').trim();
  if (!aid) return null;

  if (full) {
    const mapped = mapApiItem(full);
    const likes = Number(full.like_count ?? mapped.like_count ?? 0);
    const dislikes = Number(full.dislike_count ?? mapped.dislike_count ?? 0);
    const summaryText = getCardSummaryText(mapped);
    const imageUrl = resolveArticleImageUrl(mapped);
    return {
      ...mapped,
      id: aid,
      image_url: mapped.image_url || imageUrl || null,
      image: imageUrl || mapped.image,
      description: summaryText,
      excerpt: mapped.excerpt || summaryText,
      like_count: likes,
      dislike_count: dislikes,
      upvotes: likes,
      isBookmarked: true,
      userReaction: getRegisteredVote(aid) ?? reactionMap[aid] ?? null,
    };
  }

  return toBookmarkCard({
    id: aid,
    title: row.title || 'Saved article',
    canonical_url: row.url || '',
    url: row.url || '',
    time: row.created_at ? new Date(row.created_at).toLocaleString() : 'Recently',
    userReaction: getRegisteredVote(aid) ?? reactionMap[aid] ?? null,
  });
}

/** Load every saved bookmark as a feed card (not limited to current explore page). */
export async function loadBookmarkFeedItems() {
  const response = await listBookmarks().catch(() => ({ results: [] }));
  const rows = response.results || [];
  const reactionMap = getReactionMap();

  const detailed = await Promise.all(
    rows.map(async (row) => {
      const aid = String(row.article_id ?? '').trim();
      if (!aid) return null;
      try {
        const full = await getUserArticleDetail(aid);
        return mapBookmarkRow(row, full, reactionMap);
      } catch {
        return mapBookmarkRow(row, null, reactionMap);
      }
    }),
  );

  return detailed.filter(Boolean);
}
