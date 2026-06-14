import { newsTagsWithSubcategories } from '../route/TagSelectionScreen/constants/newsCategories';
import { fetchPlatformCategories } from '../api/newsApi';

/** Load onboarding category map from MongoDB (via API); fallback to bundled defaults. */
export async function loadTagsWithSubcategories() {
  try {
    const data = await fetchPlatformCategories();
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
        built[slug] = (cat.subcategories || [])
          .map((s) => String(s?.slug || s?.id || '').trim())
          .filter(Boolean);
      }
      if (Object.keys(built).length) return built;
    }
  } catch {
    /* offline or unauthenticated — use fallback */
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
