/**
 * Consumer feeds show Real articles only; Fake/Suspicious are admin-panel only.
 */

export function isRealFeedArticle(item) {
    if (!item) return false;
    const code = item.credibility_label ?? item.credibility?.label_code;
    if (code === 0 || code === '0') return true;
    const label = String(
        item.credibility_label_name ?? item.credibility?.label ?? item.credibilityLabel ?? ''
    ).toLowerCase();
    if (label === 'real' || label.startsWith('real')) return true;
    // API feeds are already Real-only; keep rows when credibility fields are omitted in list payloads.
    if (code == null && !label) return true;
    return false;
}

export function filterRealFeedItems(items) {
    return (items || []).filter(isRealFeedArticle);
}
