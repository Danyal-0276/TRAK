import React from 'react';
import { Sparkles, GitBranch, CheckCircle2, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import {
  LABEL_STYLES,
  normalizeLabelKey,
  getCredibilityScore,
  styleForCredibilityScore,
  getArticleCredibilityMeta,
} from '../../../utils/credibilityIndicator';

export {
  LABEL_STYLES,
  normalizeLabelKey,
  getCredibilityScore,
  styleForCredibilityScore,
  getArticleCredibilityMeta,
};

const MODERATION_STYLES = {
  review: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' },
  approved: LABEL_STYLES.real,
  rejected: LABEL_STYLES.fake,
};

/** Next to source name — same placement as user feed (green / yellow / red). */
export function ArticleCredibilitySourceDot({ article, size = 12 }) {
  const meta = getArticleCredibilityMeta(article);
  if (!meta.show) return null;

  const { style, labelKey } = meta;
  const title = meta.score != null ? `${meta.labelName} · ${meta.score}/100` : String(meta.labelName);

  if (labelKey === 'fake') {
    return (
      <span title={title} style={{ display: 'inline-flex', flexShrink: 0 }}>
        <AlertTriangle size={size} color={style.color} strokeWidth={2.5} aria-hidden />
      </span>
    );
  }

  return (
    <span title={title} style={{ display: 'inline-flex', flexShrink: 0 }}>
      <CheckCircle size={size} color={style.color} fill={style.color} strokeWidth={2.5} aria-hidden />
    </span>
  );
}

/** Top-right indicator colored by credibility score (0–100). */
export function ArticleCredibilityIndicator({ article }) {
  const meta = getArticleCredibilityMeta(article);
  if (!meta.show) return null;

  const { style, labelKey, score, labelName } = meta;
  const Icon = labelKey === 'fake' ? AlertTriangle : CheckCircle2;
  const breakdown = article.credibility_prob_breakdown;
  const distHint =
    breakdown && typeof breakdown === 'object'
      ? ` · R ${breakdown.real}% F ${breakdown.fake}% S ${breakdown.suspicious}%`
      : '';
  const title =
    score != null
      ? `Credibility score ${score}/100 (${labelName})${distHint}`
      : String(labelName);
  const iconFill = labelKey === 'fake' ? 'none' : style.color;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        flexShrink: 0,
      }}
      title={title}
    >
      <Icon
        size={18}
        color={style.color}
        fill={iconFill}
        strokeWidth={2.5}
      />
      {score != null ? (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: style.color,
            lineHeight: 1,
            letterSpacing: '-0.2px',
          }}
        >
          {score}
        </span>
      ) : null}
    </div>
  );
}

function Chip({ label, value, style, icon: Icon }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: '4px 8px',
        borderRadius: 6,
        border: `1px solid ${style.border}`,
        backgroundColor: style.bg,
        color: style.color,
        lineHeight: 1.2,
      }}
      title={value}
    >
      {Icon ? <Icon size={11} strokeWidth={2.5} /> : null}
      <span style={{ opacity: 0.85 }}>{label}:</span>
      <span>{value}</span>
    </span>
  );
}

export default function ArticleInsightBadges({ article, textSecondary, borderColor }) {
  const chips = [];
  const isProcessed = article.scope === 'processed' || article.category === 'Processed';

  if (isProcessed) {
    const meta = getArticleCredibilityMeta(article);
    if (meta.show) {
      const { labelKey, style, labelName, score } = meta;

      if (score != null) {
        chips.push(
          <Chip key="score" label="Credibility score" value={`${score}/100`} style={styleForCredibilityScore(score)} />,
        );
      }

      const conf = article.credibility_confidence_pct;
      if (conf != null && conf !== score) {
        chips.push(
          <Chip
            key="conf"
            label="Verdict confidence"
            value={`${conf}%`}
            style={style}
          />,
        );
      }

      const breakdown = article.credibility_prob_breakdown;
      if (breakdown && typeof breakdown === 'object') {
        chips.push(
          <Chip
            key="dist"
            label="Distribution"
            value={`R ${breakdown.real}% · F ${breakdown.fake}% · S ${breakdown.suspicious}%`}
            style={{
              bg: 'rgba(100, 116, 139, 0.08)',
              color: textSecondary,
              border: borderColor,
            }}
          />,
        );
      }

      chips.push(
        <Chip
          key="verdict"
          label="Verdict"
          value={String(labelName).replace(/_/g, ' ')}
          style={style}
          icon={labelKey === 'fake' ? AlertTriangle : CheckCircle2}
        />,
      );

      if (article.fact_check_verdict && article.fact_check_verdict !== 'skipped') {
        chips.push(
          <Chip
            key="fact"
            label="Fact check"
            value={String(article.fact_check_verdict).replace(/_/g, ' ')}
            style={{
              bg: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              border: 'rgba(59, 130, 246, 0.3)',
            }}
            icon={Sparkles}
          />,
        );
      }
    }

    const modStatus = String(article.moderation_status || 'review').toLowerCase();
    const modStyle = MODERATION_STYLES[modStatus] || {
      bg: 'rgba(100, 116, 139, 0.12)',
      color: textSecondary,
      border: borderColor,
    };
    const modLabel =
      modStatus === 'review' ? 'needs review' : modStatus === 'approved' ? 'approved' : modStatus === 'rejected' ? 'rejected' : modStatus;
    chips.push(
      <Chip key="moderation" label="Moderation" value={modLabel} style={modStyle} icon={ShieldCheck} />,
    );
  }

  const pipeline = article.pipeline_status;
  if (pipeline && article.scope === 'raw') {
    const pipelineColor =
      pipeline === 'done'
        ? LABEL_STYLES.real
        : pipeline === 'failed'
          ? LABEL_STYLES.fake
          : { bg: 'rgba(100, 116, 139, 0.12)', color: textSecondary, border: borderColor };
    chips.push(
      <Chip key="pipeline" label="Pipeline" value={pipeline} style={pipelineColor} icon={GitBranch} />,
    );
  }

  if (!chips.length) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
      {chips}
    </div>
  );
}

export function ArticleTopicKeywords({ keywords, textSecondary, isDark, borderColor }) {
  if (!keywords?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
      {keywords.slice(0, 5).map((kw) => (
        <span
          key={kw}
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '3px 7px',
            borderRadius: 4,
            color: textSecondary,
            backgroundColor: isDark ? 'rgba(51, 65, 85, 0.6)' : '#f1f5f9',
            border: `1px solid ${borderColor}`,
          }}
        >
          {kw}
        </span>
      ))}
    </div>
  );
}
