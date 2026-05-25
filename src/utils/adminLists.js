/** Normalize admin category rows from API (structured or legacy strings). */
export function normAdminCategories(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((x) => {
      if (typeof x === 'string') {
        const name = x.trim();
        if (!name) return null;
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return { id: slug, slug, name, subcategories: [], active: true };
      }
      const slug = String(x?.slug || x?.id || x?.name || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
      const name = String(x?.name || slug).trim();
      if (!slug) return null;
      const subs = (x?.subcategories || [])
        .map((s) => {
          if (typeof s === 'string') {
            const subSlug = s.trim().toLowerCase().replace(/\s+/g, '-');
            return subSlug ? { id: subSlug, slug: subSlug, name: s.trim() } : null;
          }
          const subSlug = String(s?.slug || s?.id || s?.name || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');
          return subSlug ? { id: subSlug, slug: subSlug, name: String(s?.name || subSlug).trim() } : null;
        })
        .filter(Boolean);
      return { id: slug, slug, name, subcategories: subs, active: x?.active !== false };
    })
    .filter(Boolean);
}

export function normAdminConnections(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((x) => {
      if (typeof x === 'string') {
        const name = x.trim();
        if (!name) return null;
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return { id: slug, slug, name, url: '', active: true };
      }
      const slug = String(x?.slug || x?.id || x?.name || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
      const name = String(x?.name || slug).trim();
      if (!slug) return null;
      return {
        id: slug,
        slug,
        name,
        url: String(x?.url || '').trim(),
        kind: String(x?.kind || 'rss').trim() || 'rss',
        active: x?.active !== false,
      };
    })
    .filter(Boolean);
}

/** @deprecated use normAdminCategories */
export function normAdminList(raw) {
  return normAdminCategories(raw);
}

export function toAdminPayloadList(items) {
  return normAdminCategories(items).map((c) => c.name);
}
