import { getBookmarkIds } from './bookmarksStorage';
import { getReactionMap } from './reactionsStorage';
import { getRegisteredVote, getRegisteredCounts, seedVoteRegistry } from './articleVoteController';
import { toBookmarkCard } from './articleBookmarkController';

export async function syncFeedInteractionsFromStorage({
  setVotedItems,
  setBookmarkedItems,
  setNewsData,
} = {}) {
  const [reactionMap, bmIds] = await Promise.all([
    getReactionMap().catch(() => ({})),
    getBookmarkIds().catch(() => []),
  ]);
  const bmSet = new Set(bmIds.map(String));
  seedVoteRegistry(reactionMap);

  if (setVotedItems) {
    setVotedItems((prev) => {
      const merged = { ...prev, ...reactionMap };
      bmSet.forEach((id) => {
        const reg = getRegisteredVote(id);
        if (reg) merged[id] = reg;
      });
      return merged;
    });
  }

  if (setBookmarkedItems) {
    setBookmarkedItems(bmSet);
  }

  if (setNewsData) {
    setNewsData((prev) =>
      (prev || []).map((n) => {
        const id = String(n.id);
        const userReaction = getRegisteredVote(id) ?? reactionMap[id] ?? n.userReaction ?? null;
        const counts = getRegisteredCounts(id);
        const next = {
          ...n,
          userReaction,
          isBookmarked: bmSet.has(id),
        };
        if (counts) {
          next.like_count = counts.like_count;
          next.dislike_count = counts.dislike_count;
          next.upvotes = counts.like_count;
        }
        return next;
      }),
    );
  }

  return { reactionMap, bookmarkIds: Array.from(bmSet) };
}

export function mergeBookmarkArticleIntoFeed(setNewsData, article, isBookmarked = true) {
  if (!setNewsData || !article) return;
  const card = toBookmarkCard(article);
  if (!card) return;
  const id = String(card.id);
  setNewsData((prev) => {
    const rows = prev || [];
    if (!isBookmarked) {
      return rows.map((n) => (String(n.id) !== id ? n : { ...n, isBookmarked: false }));
    }
    if (rows.some((n) => String(n.id) === id)) {
      return rows.map((n) =>
        String(n.id) !== id ? n : { ...n, ...card, isBookmarked: true },
      );
    }
    return [{ ...card, isBookmarked: true }, ...rows];
  });
}
