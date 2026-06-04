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
    return label === 'real' || label.startsWith('real');
}

export function filterRealFeedItems(items) {
    return (items || []).filter(isRealFeedArticle);
}
