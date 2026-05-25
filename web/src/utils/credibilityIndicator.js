/**
 * Shared credibility dot colors (real = green, suspicious = yellow, fake = red).
 */

export const LABEL_STYLES = {
  real: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.35)' },
  fake: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.35)' },
  suspicious: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' },
  unknown: { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: 'rgba(100, 116, 139, 0.35)' },
};

export function normalizeLabelKey(name, labelCode) {
  const n = String(name || '').toLowerCase();
  if (n.includes('fake') || labelCode === 1 || labelCode === '1') return 'fake';
  if (n.includes('suspicious') || n.includes('mixed') || labelCode === 2 || labelCode === '2') return 'suspicious';
  if (n.includes('real') || labelCode === 0 || labelCode === '0') return 'real';
  return 'unknown';
}

export function getCredibilityScore(article) {
  if (article?.credibility_score != null && !Number.isNaN(Number(article.credibility_score))) {
    return Math.round(Math.min(100, Math.max(0, Number(article.credibility_score))));
  }
  const probs = article?.credibility_probs;
  if (!Array.isArray(probs) || !probs.length) return null;
  try {
    const pReal = Number(probs[0]) || 0;
    const pFake = Number(probs[1]) || 0;
    const pSusp = Number(probs[2]) || 0;
    const net =
      probs.length >= 3 ? pReal - pFake - 0.25 * pSusp : pReal - pFake;
    const clamped = Math.max(-1, Math.min(1, net));
    return Math.round(50 + 50 * clamped);
  } catch {
    return null;
  }
}

export function styleForCredibilityScore(score) {
  if (score == null) return LABEL_STYLES.unknown;
  if (score >= 70) return LABEL_STYLES.real;
  if (score >= 40) return LABEL_STYLES.suspicious;
  return LABEL_STYLES.fake;
}

export function labelKeyFromScore(score) {
  if (score == null) return 'unknown';
  if (score >= 70) return 'real';
  if (score >= 40) return 'suspicious';
  return 'fake';
}

/** Meta for source-row dot + score badge (label beats score for color). */
export function getArticleCredibilityMeta(article) {
  const isProcessed = article?.scope === 'processed' || article?.category === 'Processed';

  if (!isProcessed) {
    const pipeline = article?.pipeline_status;
    if (article?.scope === 'raw' && pipeline) {
      const style =
        pipeline === 'done'
          ? LABEL_STYLES.real
          : pipeline === 'failed'
            ? LABEL_STYLES.fake
            : pipeline === 'processing'
              ? LABEL_STYLES.suspicious
              : LABEL_STYLES.unknown;
      const labelKey =
        pipeline === 'done' ? 'real' : pipeline === 'failed' ? 'fake' : pipeline === 'processing' ? 'suspicious' : 'unknown';
      return { show: labelKey !== 'unknown', labelKey, style, score: null, labelName: pipeline };
    }
    return { show: false };
  }

  const score = getCredibilityScore(article);
  const labelKey = normalizeLabelKey(article?.credibility_label_name, article?.credibility_label);
  const hasExplicitLabel = article?.credibility_label != null && article?.credibility_label !== '';
  const displayLabelKey = hasExplicitLabel && labelKey !== 'unknown' ? labelKey : labelKeyFromScore(score);
  const style =
    LABEL_STYLES[displayLabelKey] || styleForCredibilityScore(score) || LABEL_STYLES.unknown;
  const labelName =
    article?.credibility_label_name ||
    (article?.credibility_label === 0
      ? 'Real'
      : article?.credibility_label === 1
        ? 'Fake'
        : article?.credibility_label === 2
          ? 'Suspicious'
          : 'Unknown');

  if (!hasExplicitLabel && score == null) {
    return { show: false };
  }

  return {
    show: displayLabelKey !== 'unknown',
    labelKey: displayLabelKey,
    style,
    score,
    labelName,
  };
}

/** Feed card item shape from mapApiItem / NewsFeedScreen. */
export function getFeedItemCredibilityMeta(item) {
  const cred = item?.credibility || {};
  const label = cred.label ?? cred.label_name;
  const labelCode = cred.label_code ?? cred.labelCode;
  return getArticleCredibilityMeta({
    scope: 'processed',
    category: 'Processed',
    credibility_label: labelCode ?? label,
    credibility_label_name: label,
    credibility_score: cred.score,
    credibility_probs: cred.probs,
  });
}
