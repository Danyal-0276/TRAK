import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, GitBranch, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import Text from '../../../components/ui/Text';

export const LABEL_STYLES = {
  real: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.35)' },
  fake: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.35)' },
  suspicious: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' },
  unknown: { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: 'rgba(100, 116, 139, 0.35)' },
};

export function normalizeLabelKey(name, labelCode) {
  const n = String(name || '').toLowerCase();
  if (n.includes('fake') || labelCode === 1) return 'fake';
  if (n.includes('suspicious') || n.includes('mixed') || labelCode === 2) return 'suspicious';
  if (n.includes('real') || labelCode === 0) return 'real';
  return 'unknown';
}

export function getCredibilityScore(article) {
  if (article.credibility_score != null && !Number.isNaN(Number(article.credibility_score))) {
    return Math.round(Math.min(100, Math.max(0, Number(article.credibility_score))));
  }
  const probs = article.credibility_probs;
  if (!Array.isArray(probs) || !probs.length) return null;
  const pReal = Number(probs[0]) || 0;
  const pFake = Number(probs[1]) || 0;
  const pSusp = Number(probs[2]) || 0;
  const net = probs.length >= 3 ? pReal - pFake - 0.25 * pSusp : pReal - pFake;
  return Math.round(50 + 50 * Math.max(-1, Math.min(1, net)));
}

export function styleForCredibilityScore(score) {
  if (score == null) return LABEL_STYLES.unknown;
  if (score >= 70) return LABEL_STYLES.real;
  if (score >= 40) return LABEL_STYLES.suspicious;
  return LABEL_STYLES.fake;
}

export function getArticleCredibilityMeta(article) {
  const isProcessed = article.scope === 'processed' || article.category === 'Processed';
  if (!isProcessed) {
    const pipeline = article.pipeline_status;
    if (article.scope === 'raw' && pipeline) {
      const style =
        pipeline === 'done'
          ? LABEL_STYLES.real
          : pipeline === 'failed'
            ? LABEL_STYLES.fake
            : pipeline === 'processing'
              ? LABEL_STYLES.suspicious
              : LABEL_STYLES.unknown;
      return { show: true, labelKey: 'unknown', style, score: null, labelName: pipeline };
    }
    return { show: false };
  }
  const score = getCredibilityScore(article);
  const labelKey = normalizeLabelKey(article.credibility_label_name, article.credibility_label);
  const style = styleForCredibilityScore(score) || LABEL_STYLES[labelKey] || LABEL_STYLES.unknown;
  const labelName =
    article.credibility_label_name ||
    (article.credibility_label === 0 ? 'Real' : article.credibility_label === 1 ? 'Fake' : 'Suspicious');
  if (article.credibility_label == null && score == null) return { show: false };
  return { show: true, labelKey, style, score, labelName };
}

function Chip({ label, value, style, Icon }) {
  return (
    <View style={[styles.chip, { backgroundColor: style.bg, borderColor: style.border }]}>
      {Icon ? <Icon size={11} color={style.color} strokeWidth={2.5} /> : null}
      <Text variant="caption" style={{ color: style.color, fontSize: 11, fontWeight: '600' }}>
        {label}: {value}
      </Text>
    </View>
  );
}

export function ArticleCredibilityIndicator({ article }) {
  const meta = getArticleCredibilityMeta(article);
  if (!meta.show) return null;
  const { style, labelKey, score } = meta;
  const Icon = labelKey === 'fake' ? AlertTriangle : CheckCircle2;
  return (
    <View style={styles.indicator}>
      <Icon size={18} color={style.color} strokeWidth={2.5} />
      {score != null ? (
        <Text style={{ fontSize: 11, fontWeight: '700', color: style.color, marginTop: 2 }}>{score}</Text>
      ) : null}
    </View>
  );
}

export default function ArticleInsightBadges({ article, palette, textSecondary: textSecondaryProp, borderColor: borderColorProp }) {
  const textSecondary = textSecondaryProp || palette?.textSecondary || '#64748b';
  const borderColor = borderColorProp || palette?.border || '#e5e5e5';
  const chips = [];
  const isProcessed = article.scope === 'processed' || article.category === 'Processed';

  if (isProcessed) {
    const meta = getArticleCredibilityMeta(article);
    if (!meta.show) return null;
    const { labelKey, style, labelName, score } = meta;
    if (score != null) {
      chips.push(<Chip key="score" label="Credibility score" value={`${score}/100`} style={styleForCredibilityScore(score)} />);
    }
    const conf = article.credibility_confidence_pct;
    if (conf != null && conf !== score) {
      chips.push(<Chip key="conf" label="Verdict confidence" value={`${conf}%`} style={style} />);
    }
    const breakdown = article.credibility_prob_breakdown;
    if (breakdown && typeof breakdown === 'object') {
      chips.push(
        <Chip
          key="dist"
          label="Distribution"
          value={`R ${breakdown.real}% · F ${breakdown.fake}% · S ${breakdown.suspicious}%`}
          style={{ bg: 'rgba(100,116,139,0.08)', color: textSecondary, border: borderColor }}
        />
      );
    }
    chips.push(
      <Chip
        key="verdict"
        label="Verdict"
        value={String(labelName).replace(/_/g, ' ')}
        style={style}
        Icon={labelKey === 'fake' ? AlertTriangle : CheckCircle2}
      />
    );
    if (article.fact_check_verdict && article.fact_check_verdict !== 'skipped') {
      chips.push(
        <Chip
          key="fact"
          label="Fact check"
          value={String(article.fact_check_verdict).replace(/_/g, ' ')}
          style={{ bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' }}
          Icon={Sparkles}
        />
      );
    }
  }

  if (article.pipeline_status && article.scope === 'raw') {
    const pipeline = article.pipeline_status;
    const pipelineStyle =
      pipeline === 'done'
        ? LABEL_STYLES.real
        : pipeline === 'failed'
          ? LABEL_STYLES.fake
          : pipeline === 'processing'
            ? LABEL_STYLES.suspicious
            : { bg: 'rgba(100,116,139,0.12)', color: textSecondary, border: borderColor };
    chips.push(<Chip key="pipeline" label="Pipeline" value={pipeline} style={pipelineStyle} Icon={GitBranch} />);
  }

  if (!chips.length) return null;
  return <View style={styles.row}>{chips}</View>;
}

export function ArticleTopicKeywords({ keywords, textSecondary, isDark, borderColor }) {
  if (!keywords?.length) return null;
  return (
    <View style={styles.row}>
      {keywords.slice(0, 5).map((kw) => (
        <View
          key={kw}
          style={[styles.kw, { backgroundColor: isDark ? 'rgba(51,65,85,0.6)' : '#f1f5f9', borderColor }]}
        >
          <Text variant="caption" style={{ color: textSecondary, fontSize: 10, fontWeight: '600' }}>
            {kw}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  kw: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  indicator: { alignItems: 'center' },
});
