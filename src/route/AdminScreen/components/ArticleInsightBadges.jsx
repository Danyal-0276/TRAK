import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, GitBranch, CheckCircle2, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react-native';
import Text from '../../../components/ui/Text';
import {
  LABEL_STYLES,
  getArticleCredibilityMeta,
  styleForCredibilityScore,
} from '../../../utils/credibilityIndicator';

export {
  LABEL_STYLES,
  getArticleCredibilityMeta,
  styleForCredibilityScore,
} from '../../../utils/credibilityIndicator';

const MODERATION_STYLES = {
  review: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' },
  approved: LABEL_STYLES.real,
  rejected: LABEL_STYLES.fake,
};

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

/** Next to source name — same placement as user feed (green / yellow / red). */
export function ArticleCredibilitySourceDot({ article, size = 12 }) {
  const meta = getArticleCredibilityMeta(article);
  if (!meta.show) return null;

  const { style, labelKey } = meta;
  const title = meta.score != null ? `${meta.labelName} · ${meta.score}/100` : String(meta.labelName);

  if (labelKey === 'fake') {
    return <AlertTriangle size={size} color={style.color} strokeWidth={2.5} accessibilityLabel={title} />;
  }

  return <CheckCircle size={size} color={style.color} fill={style.color} strokeWidth={2.5} accessibilityLabel={title} />;
}

/** Top-right indicator colored by credibility score (0–100). */
export function ArticleCredibilityIndicator({ article }) {
  const meta = getArticleCredibilityMeta(article);
  if (!meta.show) return null;

  const { style, labelKey, score } = meta;
  const Icon = labelKey === 'fake' ? AlertTriangle : CheckCircle2;
  const iconFill = labelKey === 'fake' ? 'none' : style.color;

  return (
    <View style={styles.indicator}>
      <Icon size={18} color={style.color} fill={iconFill} strokeWidth={2.5} />
      {score != null ? (
        <Text style={{ fontSize: 11, fontWeight: '700', color: style.color, marginTop: 2 }}>{score}</Text>
      ) : null}
    </View>
  );
}

function moderationChip(article, textSecondary, borderColor) {
  const isProcessed = article.scope === 'processed' || article.category === 'Processed';
  if (!isProcessed) return null;

  const status = String(article.moderation_status || 'review').toLowerCase();
  const style = MODERATION_STYLES[status] || {
    bg: 'rgba(100, 116, 139, 0.12)',
    color: textSecondary,
    border: borderColor,
  };
  const label =
    status === 'review' ? 'needs review' : status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status;

  return (
    <Chip key="moderation" label="Moderation" value={label} style={style} Icon={ShieldCheck} />
  );
}

export default function ArticleInsightBadges({ article, palette, textSecondary: textSecondaryProp, borderColor: borderColorProp }) {
  const textSecondary = textSecondaryProp || palette?.textSecondary || '#64748b';
  const borderColor = borderColorProp || palette?.border || '#e5e5e5';
  const chips = [];
  const isProcessed = article.scope === 'processed' || article.category === 'Processed';

  if (isProcessed) {
    const meta = getArticleCredibilityMeta(article);
    if (meta.show) {
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

    const modChip = moderationChip(article, textSecondary, borderColor);
    if (modChip) chips.push(modChip);
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
