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

/** Flat set of main + sub category slugs for keyword deduplication. */
export function taxonomyTermsFromMap(tagsMap) {
  return new Set(
    Object.entries(tagsMap || {}).flatMap(([main, subs]) => [main, ...(subs || [])])
  );
}
