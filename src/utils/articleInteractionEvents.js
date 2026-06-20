/** Broadcast bookmark / reaction changes across feed cards and article detail. */

import { useEffect } from 'react';
import { setRegisteredCounts } from './articleVoteController';
import { patchBookmarkTabItems } from './buildBookmarksTabNews';

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
    setVotedItems((prev) => {
      if (prev?.[id] === patch.userReaction) return prev;
      return { ...prev, [id]: patch.userReaction };
    });
  }

  if (patch.isBookmarked !== undefined && setBookmarkedItems) {
    setBookmarkedItems((prev) => {
      const next = new Set(prev);
      const had = next.has(id);
      if (patch.isBookmarked) {
        if (had) return prev;
        next.add(id);
      } else {
        if (!had) return prev;
        next.delete(id);
      }
      return next;
    });
  }

  if (onArticlesPatch) {
    onArticlesPatch((prev) => {
      const rows = prev || [];
      if (patch.isBookmarked && patch.article) {
        if (rows.some((n) => String(n.id) === id)) {
          let changed = false;
          const next = rows.map((n) => {
            if (String(n.id) !== id) return n;
            const row = { ...n, ...patch.article, isBookmarked: true };
            if (patch.userReaction !== undefined) row.userReaction = patch.userReaction;
            if (patch.like_count !== undefined) {
              row.like_count = patch.like_count;
              row.upvotes = patch.like_count;
            }
            if (patch.dislike_count !== undefined) row.dislike_count = patch.dislike_count;
            if (
              row.userReaction === n.userReaction &&
              !!row.isBookmarked === !!n.isBookmarked &&
              Number(row.like_count ?? row.upvotes ?? 0) === Number(n.like_count ?? n.upvotes ?? 0) &&
              Number(row.dislike_count ?? 0) === Number(n.dislike_count ?? 0)
            ) {
              return n;
            }
            changed = true;
            return row;
          });
          return changed ? next : rows;
        }
        return [{ ...patch.article, isBookmarked: true }, ...rows];
      }

      let changed = false;
      const next = rows.map((n) => {
        if (String(n.id) !== id) return n;
        const row = { ...n };
        let rowChanged = false;
        if (patch.userReaction !== undefined && row.userReaction !== patch.userReaction) {
          row.userReaction = patch.userReaction;
          rowChanged = true;
        }
        if (patch.isBookmarked !== undefined && !!row.isBookmarked !== !!patch.isBookmarked) {
          row.isBookmarked = patch.isBookmarked;
          rowChanged = true;
        }
        if (
          patch.like_count !== undefined &&
          Number(row.like_count ?? row.upvotes ?? 0) !== Number(patch.like_count)
        ) {
          row.like_count = patch.like_count;
          row.upvotes = patch.like_count;
          rowChanged = true;
        }
        if (
          patch.dislike_count !== undefined &&
          Number(row.dislike_count ?? 0) !== Number(patch.dislike_count)
        ) {
          row.dislike_count = patch.dislike_count;
          rowChanged = true;
        }
        if (!rowChanged) return n;
        changed = true;
        return row;
      });
      return changed ? next : rows;
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
        if (setStats) setStats((s) => ({ ...s, saved: (s?.saved || 0) + 1 }));
        return next;
      }
      const next = rows.filter((b) => String(b.id) !== id);
      if (next.length !== rows.length && setStats) {
        setStats((s) => ({ ...s, saved: Math.max(0, (s?.saved || 0) - 1) }));
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
  setBookmarkTabItems,
} = {}) {
  useEffect(() => {
    return subscribeArticleInteractionChange((patch) => {
      applyArticleInteractionPatch(patch, {
        setVotedItems,
        setBookmarkedItems,
        onArticlesPatch,
      });
      if (setBookmarkTabItems) {
        patchBookmarkTabItems(setBookmarkTabItems, patch);
      }
    });
  }, [setVotedItems, setBookmarkedItems, onArticlesPatch, setBookmarkTabItems]);
}
