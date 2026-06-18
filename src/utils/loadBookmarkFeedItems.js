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

  if (full?.title && (full.excerpt || full.description || full.image || full.image_url)) {
    const summaryText = getCardSummaryText(full);
    const imageUrl = resolveArticleImageUrl(full);
    const likes = Number(full.like_count ?? full.upvotes ?? 0);
    const dislikes = Number(full.dislike_count ?? 0);
    return {
      ...toBookmarkCard(full),
      id: aid,
      image_url: full.image_url || imageUrl || null,
      image: imageUrl || full.image,
      description: summaryText || full.description || full.excerpt || '',
      excerpt: full.excerpt || summaryText || '',
      like_count: likes,
      dislike_count: dislikes,
      upvotes: likes,
      isBookmarked: true,
      userReaction: getRegisteredVote(aid) ?? reactionMap[aid] ?? full.userReaction ?? null,
    };
  }

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

export function bookmarkCardsFromRows(rows, reactionMap = {}, knownById = {}) {
  return (rows || [])
    .map((row) => {
      const aid = String(row.article_id ?? '').trim();
      if (!aid) return null;
      return mapBookmarkRow(row, knownById[aid], reactionMap);
    })
    .filter(Boolean);
}

async function mapWithConcurrency(items, mapper, limit = 4) {
  const out = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index;
      index += 1;
      out[i] = await mapper(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

function needsDetailEnrichment(item) {
  return !item?.excerpt && !item?.description && !item?.image && !item?.image_url;
}

/** Fast cards from bookmark list + in-memory feed rows (no per-article detail fetch). */
export async function loadBookmarkFeedItemsFast({ knownById = {}, rows: prefetchedRows } = {}) {
  const rows =
    prefetchedRows ||
    (await listBookmarks().catch(() => ({ results: [] }))).results ||
    [];
  const reactionMap = await getReactionMap().catch(() => ({}));
  return bookmarkCardsFromRows(rows, reactionMap, knownById);
}

/** Optional background enrichment for cards missing image/summary. */
export async function enrichBookmarkFeedItems(items, { rows = [] } = {}) {
  const list = items || [];
  if (!list.length) return list;

  const rowById = Object.fromEntries(
    (rows || []).map((r) => [String(r.article_id ?? ''), r]).filter(([id]) => id),
  );

  return mapWithConcurrency(list, async (item) => {
    if (!needsDetailEnrichment(item)) return item;
    const aid = String(item.id);
    try {
      const full = await getUserArticleDetail(aid);
      const reactionMap = await getReactionMap().catch(() => ({}));
      return mapBookmarkRow(rowById[aid] || { article_id: aid, title: item.title }, full, reactionMap) || item;
    } catch {
      return item;
    }
  });
}

/** Load saved bookmarks as feed cards — fast first, enrich only when requested. */
export async function loadBookmarkFeedItems({ knownById = {}, enrichDetails = false, rows } = {}) {
  const bookmarkRows =
    rows || (await listBookmarks().catch(() => ({ results: [] }))).results || [];
  const items = await loadBookmarkFeedItemsFast({ knownById, rows: bookmarkRows });
  if (!enrichDetails) return items;
  return enrichBookmarkFeedItems(items, { rows: bookmarkRows });
}
