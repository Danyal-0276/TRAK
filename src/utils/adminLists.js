/** Normalize admin category/connection rows (strings or {id,name} objects). */
export function normAdminList(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((x, i) => {
      if (typeof x === 'string') {
        const name = x.trim();
        return name ? { id: name, name } : null;
      }
      const name = String(x?.name || x?.id || '').trim();
      return name ? { id: String(x?.id || name), name } : null;
    })
    .filter(Boolean);
}

export function toAdminPayloadList(items) {
  return normAdminList(items).map((c) => c.name);
}
