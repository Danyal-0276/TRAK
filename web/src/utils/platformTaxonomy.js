import { newsTagsWithSubcategories } from '../route/TagSelectionScreen/constants/newsCategories';
import { fetchPlatformCategories } from './Service/api';

/** Load onboarding category map from API; fallback to bundled defaults if offline/empty. */
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
