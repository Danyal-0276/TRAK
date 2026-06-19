import { newsTagsWithSubcategories } from '../route/TagSelectionScreen/constants/newsCategories';
import { fetchPlatformCategories } from './Service/api';

/** Load onboarding category map from API; fallback to bundled defaults if offline/empty. */
export async function loadTagsWithSubcategories() {
  try {
    const data = await fetchPlatformCategoriesCached({ includeCounts: false });
    const map = data?.tags_with_subcategories;
    if (map && typeof map === 'object' && Object.keys(map).length > 0) {
      return map;
    }
    const categories = data?.categories;
    if (Array.isArray(categories) && categories.length > 0) {
      const built = {};
      for (const cat of categories) {
        const slug = String(cat?.slug || cat?.id || '').trim();
        if (!slug) continue;
        built[slug] = (cat.subcategories || []).map((s) => String(s?.slug || s?.id || '').trim()).filter(Boolean);
      }
      if (Object.keys(built).length) return built;
    }
  } catch {
    /* use fallback */
  }
  return { ...newsTagsWithSubcategories };
}

/** Flat set of main + sub category slugs (lowercased) for keyword deduplication. */
export function taxonomyTermsFromMap(tagsMap) {
  const terms = new Set();
  for (const [main, subs] of Object.entries(tagsMap || {})) {
    if (main) terms.add(String(main).toLowerCase());
    for (const sub of subs || []) {
      if (sub) terms.add(String(sub).toLowerCase());
    }
  }
  return terms;
}

function keywordVariants(term) {
  const base = String(term || '').trim().toLowerCase();
  if (!base) return [];
  const slug = base.replace(/\s+/g, '-');
  const spaced = base.replace(/-/g, ' ');
  return [...new Set([base, slug, spaced])];
}

/** Match saved keyword to a taxonomy tag (handles slug vs spaced labels). */
export function seedMatchesTag(seed, tag) {
  const variants = new Set(keywordVariants(seed));
  const tagVariants = keywordVariants(tag);
  return tagVariants.some((t) => variants.has(t));
}

/**
 * Split stored interests into category selections vs custom keywords.
 * Used when opening settings (preload) — signup flows pass fromSignup and skip this.
 */
export function resolveSavedInterestSelections(saved, tagsMap, routeSelectedTags = []) {
  const savedList = (saved || []).map((x) => String(x || '').trim()).filter(Boolean);
  const routeList = (routeSelectedTags || []).map((x) => String(x || '').trim()).filter(Boolean);
  const terms = taxonomyTermsFromMap(tagsMap);
  const selectedTagSet = new Set();

  for (const main of Object.keys(tagsMap || {})) {
    const subs = tagsMap[main] || [];
    const seeds = [...savedList, ...routeList];
    if (seeds.some((s) => seedMatchesTag(s, main))) {
      selectedTagSet.add(main);
    }
    for (const sub of subs) {
      if (seeds.some((s) => seedMatchesTag(s, sub))) {
        selectedTagSet.add(main);
        selectedTagSet.add(sub);
      }
    }
  }

  const isCategoryTerm = (k) => {
    const lower = String(k || '').toLowerCase();
    if (terms.has(lower)) return true;
    for (const tag of selectedTagSet) {
      if (seedMatchesTag(k, tag)) return true;
    }
    return false;
  };

  const customKeywords = savedList
    .map((k) => k.toLowerCase())
    .filter((k) => k && !isCategoryTerm(k));

  const preservedCategoryTags = routeList.length
    ? routeList.map((k) => k.toLowerCase())
    : savedList.map((k) => k.toLowerCase()).filter((k) => isCategoryTerm(k));

  return {
    selectedTags: Array.from(selectedTagSet),
    customKeywords,
    preservedCategoryTags: [...new Set(preservedCategoryTags)],
  };
}

const DEFAULT_EXPLORE_TABS = ['All', 'Sports', 'Technology', 'Environment', 'Business', 'Wildlife'];

const PLATFORM_CATEGORIES_CACHE_KEY = 'trak:platform-categories';
const PLATFORM_CATEGORIES_TTL_MS = 8 * 60 * 1000;

function readPlatformCategoriesCache() {
  try {
    const raw = sessionStorage.getItem(PLATFORM_CATEGORIES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || Date.now() - (parsed.savedAt || 0) > PLATFORM_CATEGORIES_TTL_MS) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writePlatformCategoriesCache(data) {
  try {
    sessionStorage.setItem(
      PLATFORM_CATEGORIES_CACHE_KEY,
      JSON.stringify({ data, savedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

/** Fast taxonomy first (no counts), then merge counts when available. */
export async function fetchPlatformCategoriesCached({ includeCounts = true } = {}) {
  const cached = readPlatformCategoriesCache();
  if (cached && (!includeCounts || Object.keys(cached.category_counts || {}).length > 0)) {
    return cached;
  }

  if (!includeCounts) {
    const data = await fetchPlatformCategories({ includeCounts: false });
    writePlatformCategoriesCache(data);
    return data;
  }

  const fast = cached || (await fetchPlatformCategories({ includeCounts: false }));
  if (!fast?.categories?.length) {
    const full = await fetchPlatformCategories({ includeCounts: true });
    writePlatformCategoriesCache(full);
    return full;
  }

  try {
    const withCounts = await fetchPlatformCategories({ includeCounts: true });
    const merged = { ...fast, category_counts: withCounts.category_counts || {} };
    writePlatformCategoriesCache(merged);
    return merged;
  } catch {
    writePlatformCategoriesCache(fast);
    return fast;
  }
}

export function formatPlatformCategoryLabel(cat) {
  const name = String(cat?.name || '').trim();
  if (name) return name;
  const slug = String(cat?.slug || cat?.id || '').trim();
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildExploreTabsFromPlatform(data) {
  const apiCounts = data?.category_counts || {};
  const cats = (data?.categories || []).filter((c) => c?.active !== false);

  const rows = cats
    .map((cat) => {
      const slug = String(cat?.slug || cat?.id || '').trim();
      const label = formatPlatformCategoryLabel(cat);
      const count = Number(apiCounts[slug] || 0);
      return { slug, label, count };
    })
    .filter((row) => row.label)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const withArticles = rows.filter((row) => row.count > 0);
  const displayRows = withArticles.length > 0 ? withArticles : rows.slice(0, 12);

  const countsByLabel = { All: withArticles.reduce((sum, row) => sum + row.count, 0) };
  for (const row of displayRows) {
    countsByLabel[row.label] = row.count;
  }

  return {
    tabs: ['All', ...displayRows.map((row) => row.label)],
    categories: cats,
    categoryCounts: apiCounts,
    countsByLabel,
  };
}

/** Count explore chips from a loaded article batch (search/filter context). */
export function buildExploreCountsFromArticles(articles = [], platformCategories = []) {
  const counts = { All: articles.length };
  for (const item of articles) {
    const slug = String(item?.primary_category || '').trim();
    if (!slug) continue;
    const platformCat = platformCategories.find((c) => String(c?.slug || '').trim() === slug);
    const label = platformCat
      ? formatPlatformCategoryLabel(platformCat)
      : slug.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    counts[label] = (counts[label] || 0) + 1;
  }
  return counts;
}

/** Labels with articles in the batch, sorted by count (All first). */
export function exploreTabsFromCounts(counts = {}) {
  const tabs = Object.entries(counts)
    .filter(([label, count]) => label !== 'All' && Number(count) > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label]) => label);
  return ['All', ...tabs];
}

/** Explore/search category chips — show taxonomy categories even when counts are still loading. */
export async function loadExploreCategoryTabs() {
  return loadExploreCategoryTabsProgressive();
}

/**
 * Phase A: fast taxonomy (no counts) via onFast callback.
 * Phase B: fetch counts and return final tab set.
 */
export async function loadExploreCategoryTabsProgressive(onFast) {
  const fallback = {
    tabs: [...DEFAULT_EXPLORE_TABS],
    categories: [],
    categoryCounts: {},
    countsByLabel: { All: 0 },
  };

  try {
    let fast = readPlatformCategoriesCache();
    if (!fast?.categories?.length) {
      fast = await fetchPlatformCategories({ includeCounts: false });
      writePlatformCategoriesCache(fast);
    }

    const fastBuilt = buildExploreTabsFromPlatform(fast);
    onFast?.(fastBuilt);

    try {
      const withCounts = await fetchPlatformCategories({ includeCounts: true });
      const merged = { ...fast, category_counts: withCounts.category_counts || {} };
      writePlatformCategoriesCache(merged);
      return buildExploreTabsFromPlatform(merged);
    } catch {
      return fastBuilt;
    }
  } catch {
    return fallback;
  }
}

export function exploreTabToCategorySlug(tab, categories = []) {
  if (!tab || tab === 'All') return '';
  const match = (categories || []).find((cat) => formatPlatformCategoryLabel(cat) === tab);
  if (match?.slug) return String(match.slug).trim();
  return String(tab).trim().toLowerCase().replace(/\s+/g, '-');
}
