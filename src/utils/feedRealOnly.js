/**
 * Consumer feeds show Real articles only; Fake/Suspicious are admin-panel only.
 */

export function isRealFeedArticle(item) {
    if (!item) return false;
    const code = item.credibility_label ?? item.credibility?.label_code;
    const label = String(
        item.credibility_label_name ?? item.credibility?.label ?? item.credibilityLabel ?? ''
    ).toLowerCase();
    if (code === 1 || code === '1' || code === 2 || code === '2') return false;
    if (label.includes('fake') || label.includes('suspicious')) return false;
    if (code === 0 || code === '0') return true;
    if (label === 'real' || label.startsWith('real')) return true;
    return false;
}

export function filterRealFeedItems(items) {
    return (items || []).filter(isRealFeedArticle);
}
