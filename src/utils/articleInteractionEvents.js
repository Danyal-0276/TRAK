/** Broadcast bookmark / reaction changes across feed cards and article detail. */

import { useEffect } from 'react';
import { setRegisteredCounts } from './articleVoteController';

const listeners = new Set();

export function emitArticleInteractionChange(patch = {}) {
  const articleId = String(patch.articleId || '').trim();
  if (!articleId) return;
  const payload = { ...patch, articleId };
  if (patch.like_count !== undefined || patch.dislike_count !== undefined) {
    setRegisteredCounts(articleId, patch.like_count, patch.dislike_count);
  }
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch {
      /* ignore */
    }
  });
}

export function subscribeArticleInteractionChange(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

/** Apply a single-article interaction patch to list + Set/Map state. */
export function applyArticleInteractionPatch(
  patch,
  { setVotedItems, setBookmarkedItems, onArticlesPatch } = {},
) {
  const id = String(patch.articleId || '').trim();
  if (!id) return;

  if (patch.userReaction !== undefined && setVotedItems) {
    setVotedItems((prev) => ({ ...prev, [id]: patch.userReaction }));
  }

  if (patch.isBookmarked !== undefined && setBookmarkedItems) {
    setBookmarkedItems((prev) => {
      const next = new Set(prev);
      if (patch.isBookmarked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (onArticlesPatch) {
    onArticlesPatch((prev) => {
      const rows = prev || [];
      if (patch.isBookmarked && patch.article) {
        if (rows.some((n) => String(n.id) === id)) {
          return rows.map((n) => {
            if (String(n.id) !== id) return n;
            const next = { ...n, ...patch.article, isBookmarked: true };
            if (patch.userReaction !== undefined) next.userReaction = patch.userReaction;
            if (patch.like_count !== undefined) {
              next.like_count = patch.like_count;
              next.upvotes = patch.like_count;
            }
            if (patch.dislike_count !== undefined) next.dislike_count = patch.dislike_count;
            return next;
          });
        }
        return [{ ...patch.article, isBookmarked: true }, ...rows];
      }
      return rows.map((n) => {
        if (String(n.id) !== id) return n;
        const next = { ...n };
        if (patch.userReaction !== undefined) next.userReaction = patch.userReaction;
        if (patch.isBookmarked !== undefined) next.isBookmarked = patch.isBookmarked;
        if (patch.like_count !== undefined) {
          next.like_count = patch.like_count;
          next.upvotes = patch.like_count;
        }
        if (patch.dislike_count !== undefined) next.dislike_count = patch.dislike_count;
        return next;
      });
    });
  }
}

/** Profile / bookmarks list: add or remove saved article cards instantly. */
export function applyBookmarkListPatch(
  patch,
  { setBookmarks, setBookmarkedItems, setStats, removeFromNewsData } = {},
) {
  applyArticleInteractionPatch(patch, { setBookmarkedItems });
  const id = String(patch.articleId || '').trim();
  if (!id || patch.isBookmarked === undefined) return;

  if (setBookmarks) {
    setBookmarks((prev) => {
      const rows = prev || [];
      if (patch.isBookmarked) {
        if (rows.some((b) => String(b.id) === id)) return rows;
        if (!patch.article) return rows;
        const next = [patch.article, ...rows];
        if (setStats) setStats((s) => ({ ...s, saved: next.length }));
        return next;
      }
      const next = rows.filter((b) => String(b.id) !== id);
      if (next.length !== rows.length && setStats) {
        setStats((s) => ({ ...s, saved: next.length }));
      }
      return next;
    });
  } else if (setStats) {
    setStats((prev) => ({
      ...prev,
      saved: patch.isBookmarked
        ? (prev?.saved || 0) + 1
        : Math.max(0, (prev?.saved || 0) - 1),
    }));
  }

  if (!patch.isBookmarked && removeFromNewsData) {
    removeFromNewsData(id);
  }
}

export function useArticleInteractionListener({
  setVotedItems,
  setBookmarkedItems,
  onArticlesPatch,
} = {}) {
  useEffect(() => {
    return subscribeArticleInteractionChange((patch) => {
      applyArticleInteractionPatch(patch, {
        setVotedItems,
        setBookmarkedItems,
        onArticlesPatch,
      });
    });
  }, [setVotedItems, setBookmarkedItems, onArticlesPatch]);
}
