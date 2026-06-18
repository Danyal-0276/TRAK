import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getProfile,
  getUserArticleDetail,
  listBookmarks,
  listReactions,
} from './Service/api';
import { mapApiItem } from './loadFeed';
import { filterRealFeedItems } from './feedRealOnly';

export const PROFILE_CACHE_KEY = 'trak_profile_cache_v1';
export const PROFILE_BOOKMARKS_CACHE_KEY = 'trak_profile_bookmarks_cache_v1';

const PROFILE_STALE_MS = 5 * 60 * 1000;
const PROFILE_PREVIEW_LIMIT = 5;

let sessionCache = null;
let preloadPromise = null;

export function stripLastLogin(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const { last_login: _ignored, ...rest } = obj;
  return rest;
}

export function isProfileCacheFresh(entry = sessionCache, { requireProfile = true } = {}) {
  if (!entry?.fetchedAt || Date.now() - entry.fetchedAt >= PROFILE_STALE_MS) return false;
  if (requireProfile && !entry.profile) return false;
  return true;
}

export function getProfileSessionCache() {
  return sessionCache;
}

export function clearProfileSessionCache() {
  sessionCache = null;
  preloadPromise = null;
  AsyncStorage.multiRemove([PROFILE_CACHE_KEY, PROFILE_BOOKMARKS_CACHE_KEY]).catch(() => {});
}

function buildReactionMap(reactions) {
  const reactionMap = {};
  for (const r of reactions || []) {
    const aid = String(r.article_id ?? '').trim();
    const react = String(r.reaction || '').toLowerCase();
    if (!aid) continue;
    if (react === 'like') reactionMap[aid] = 'up';
    else if (react === 'dislike') reactionMap[aid] = 'down';
  }
  return reactionMap;
}

function computeStats(reactions, bookmarkRows) {
  let liked = 0;
  let disliked = 0;
  for (const r of reactions || []) {
    const react = String(r.reaction || '').toLowerCase();
    if (react === 'like') liked += 1;
    else if (react === 'dislike') disliked += 1;
  }
  return {
    liked,
    disliked,
    saved: Array.isArray(bookmarkRows) ? bookmarkRows.length : 0,
  };
}

export function mapBookmarkRow(row) {
  const aid = String(row?.article_id ?? row?.id ?? '').trim();
  if (!aid) return null;
  return {
    id: aid,
    title: row.title || 'Saved article',
    source: 'TRAK',
    excerpt: '',
    description: '',
    content: '',
    fullContent: '',
    canonical_url: row.url || row.canonical_url || '',
    url: row.url || row.canonical_url || '',
    category: 'Saved',
    time: row.created_at ? new Date(row.created_at).toLocaleString() : 'Recently',
    date: row.created_at ? new Date(row.created_at).toLocaleString() : 'Recently',
    like_count: 0,
    dislike_count: 0,
    upvotes: 0,
    votes: 0,
  };
}

async function enrichBookmarkArticle(row, mapped) {
  const aid = String(mapped.id);
  try {
    const full = await getUserArticleDetail(aid);
    const apiMapped = mapApiItem({ ...full, id: aid });
    return {
      ...apiMapped,
      id: aid,
      description: apiMapped.excerpt || apiMapped.summary || '',
      excerpt: apiMapped.excerpt || apiMapped.summary || '',
      content: apiMapped.content || apiMapped.fullContent || '',
      fullContent: apiMapped.fullContent || apiMapped.content || '',
      canonical_url: apiMapped.canonical_url || row.url || row.canonical_url || '',
      url: apiMapped.canonical_url || row.url || '',
      category: full.topic_keywords?.[0] || apiMapped.category || 'Saved',
      time: full.published_at
        ? new Date(full.published_at).toLocaleString()
        : (row.created_at ? new Date(row.created_at).toLocaleString() : apiMapped.time || 'Recently'),
      date: full.published_at
        ? new Date(full.published_at).toLocaleString()
        : (row.created_at ? new Date(row.created_at).toLocaleString() : 'Recently'),
      image: full.image || full.image_url || apiMapped.image,
      image_url: full.image_url || full.image || apiMapped.image_url,
    };
  } catch {
    return mapped;
  }
}

async function enrichBookmarkPreview(bookmarkRows, limit = PROFILE_PREVIEW_LIMIT) {
  const lightweight = (bookmarkRows || []).map(mapBookmarkRow).filter(Boolean);
  if (!lightweight.length) return [];

  const previewRows = (bookmarkRows || []).slice(0, limit);
  const enrichedHead = await Promise.all(
    previewRows.map(async (row, index) => {
      const mapped = lightweight[index];
      if (!mapped) return null;
      return enrichBookmarkArticle(row, mapped);
    })
  );

  const head = filterRealFeedItems(enrichedHead.filter(Boolean));
  const tail = lightweight.slice(limit);
  return [...head, ...tail];
}

async function persistProfileBundle(bundle) {
  sessionCache = bundle;
  try {
    if (bundle.profile) {
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(bundle.profile));
    }
    if (Array.isArray(bundle.bookmarks)) {
      await AsyncStorage.setItem(
        PROFILE_BOOKMARKS_CACHE_KEY,
        JSON.stringify(bundle.bookmarks.slice(0, PROFILE_PREVIEW_LIMIT))
      );
    }
  } catch {
    // ignore storage failures
  }
}

export async function hydrateProfileFromStorage() {
  if (sessionCache) return sessionCache;

  let profile = null;
  let bookmarks = [];

  try {
    const rawProfile = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    if (rawProfile) profile = stripLastLogin(JSON.parse(rawProfile));
  } catch {
    profile = null;
  }

  try {
    const rawBookmarks = await AsyncStorage.getItem(PROFILE_BOOKMARKS_CACHE_KEY);
    if (rawBookmarks) {
      const parsed = JSON.parse(rawBookmarks);
      if (Array.isArray(parsed)) bookmarks = parsed;
    }
  } catch {
    bookmarks = [];
  }

  if (!profile && !bookmarks.length) return null;

  const bundle = {
    profile,
    bookmarks,
    votedItems: {},
    stats: {
      liked: 0,
      disliked: 0,
      saved: bookmarks.length,
    },
    fetchedAt: 0,
  };
  sessionCache = bundle;
  return bundle;
}

export function seedProfileFromBootstrap({ bookmarkRows = [], reactionResults = [] } = {}) {
  const reactions = reactionResults || [];
  const rows = bookmarkRows || [];
  const stats = computeStats(reactions, rows);
  const votedItems = buildReactionMap(reactions);
  const bookmarks = rows.map(mapBookmarkRow).filter(Boolean);

  sessionCache = {
    profile: sessionCache?.profile || null,
    stats,
    bookmarks,
    votedItems,
    fetchedAt: sessionCache?.profile ? Date.now() : 0,
  };
  return sessionCache;
}

export async function loadProfileBundle({ force = false, enrichLimit = PROFILE_PREVIEW_LIMIT } = {}) {
  if (!force && isProfileCacheFresh(sessionCache, { requireProfile: true })) {
    return sessionCache;
  }

  const [profileResult, reactResult, bookmarkResult] = await Promise.allSettled([
    getProfile(),
    listReactions(),
    listBookmarks(),
  ]);

  const profile =
    profileResult.status === 'fulfilled'
      ? stripLastLogin(profileResult.value)
      : sessionCache?.profile || null;

  const reactions =
    reactResult.status === 'fulfilled' ? reactResult.value.results || [] : [];
  const bookmarkRows =
    bookmarkResult.status === 'fulfilled' ? bookmarkResult.value.results || [] : [];

  const stats = computeStats(reactions, bookmarkRows);
  const votedItems = buildReactionMap(reactions);
  const bookmarks = await enrichBookmarkPreview(bookmarkRows, enrichLimit);

  const bundle = {
    profile,
    stats,
    bookmarks,
    votedItems,
    fetchedAt: Date.now(),
  };

  await persistProfileBundle(bundle);
  return bundle;
}

/** Keep profile preview bookmarks in sync when user saves/unsaves from any screen. */
export function patchProfileSessionBookmark(articleId, isBookmarked, article) {
  const id = String(articleId || '').trim();
  if (!id) return;

  const prev = sessionCache?.bookmarks || [];
  let bookmarks;
  if (isBookmarked) {
    if (prev.some((b) => String(b.id) === id)) {
      bookmarks = prev;
    } else if (article) {
      bookmarks = [article, ...prev].slice(0, PROFILE_PREVIEW_LIMIT);
    } else {
      bookmarks = prev;
    }
  } else {
    bookmarks = prev.filter((b) => String(b.id) !== id);
  }

  const stats = {
    ...(sessionCache?.stats || { liked: 0, disliked: 0, saved: 0 }),
    saved: bookmarks.length,
  };

  sessionCache = {
    ...(sessionCache || {}),
    bookmarks,
    stats,
    fetchedAt: sessionCache?.fetchedAt || Date.now(),
  };

  persistProfileBundle(sessionCache).catch(() => {});
}

export function preloadProfileData({ skipIfFresh = true, force = false } = {}) {
  if (!force && skipIfFresh && isProfileCacheFresh(sessionCache, { requireProfile: true })) {
    return Promise.resolve(sessionCache);
  }
  if (preloadPromise) return preloadPromise;

  preloadPromise = loadProfileBundle({ force })
    .catch(() => sessionCache)
    .finally(() => {
      preloadPromise = null;
    });

  return preloadPromise;
}
