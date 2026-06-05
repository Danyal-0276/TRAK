import React, { useMemo, useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Eye,
  Rss,
  Inbox,
  Clock,
  Loader,
  XCircle,
  Info,
  Workflow,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import {
  FEED_FILTERS,
  PIPELINE_FILTERS,
  NEEDS_REVIEW_HELP,
  buildArticleCountDisplay,
} from '../../../utils/adminArticleFilters';
import './adminArticlesControlPanel.css';

const FEED_ICONS = { '': Rss, fake: AlertTriangle, suspicious: AlertCircle, review: Eye, approved: CheckCircle2 };
const PIPELINE_ICONS = { queue: Inbox, pending: Clock, processing: Loader, failed: XCircle };

const STAT_META = {
  unique: { icon: Layers, accentKey: 'sources', short: 'Unique' },
  processed: { icon: CheckCircle2, accentKey: 'processed', short: 'Processed' },
  review: { icon: Eye, accentKey: 'failed', short: 'Review' },
  filtered: { icon: Layers, accentKey: 'queue', short: 'Filter' },
};

function accentFromPalette(palette, key) {
  return palette.statAccent?.[key] || palette.info || palette.primary;
}

export default function AdminArticlesControlPanel({
  palette,
  isDark,
  loading,
  articleCounts,
  pipelineFilter,
  onFilterChange,
  displayedCount,
  searchQuery,
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  const countDisplay = useMemo(
    () =>
      buildArticleCountDisplay({
        counts: articleCounts,
        pipelineFilter,
        displayedCount,
        searchQuery,
      }),
    [articleCounts, pipelineFilter, displayedCount, searchQuery]
  );

  const showStats = (loading && !articleCounts) || articleCounts;

  return (
    <section
      className="admin-articles-panel"
      style={{
        marginTop: 12,
        borderColor: palette.border,
        background: palette.card,
        boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.06)' : '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div className="admin-articles-panel__main">
        {showStats ? (
          <div className="admin-articles-panel__stats">
            {countDisplay.pills.map((pill) => {
              const meta = STAT_META[pill.key] || STAT_META.unique;
              const Icon = meta.icon;
              const accent = accentFromPalette(palette, meta.accentKey);
              return (
                <div
                  key={pill.key}
                  className="admin-articles-panel__stat"
                  style={{
                    borderColor: pill.active ? `${accent}55` : palette.borderLight,
                    background: pill.active
                      ? (isDark ? `${accent}14` : `${accent}0a`)
                      : (isDark ? 'rgba(255,255,255,0.03)' : palette.pageAlt),
                  }}
                >
                  <div
                    className="admin-articles-panel__stat-icon"
                    style={{
                      background: isDark ? `${accent}22` : `${accent}12`,
                      color: accent,
                    }}
                  >
                    <Icon size={13} strokeWidth={2.25} />
                  </div>
                  <div className="admin-articles-panel__stat-text">
                    <span style={{ color: palette.textPrimary }}>
                      {loading && !articleCounts ? '—' : pill.value}
                    </span>
                    <span style={{ color: palette.textTertiary }}>{meta.short}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {showStats ? (
          <div className="admin-articles-panel__divider" style={{ background: palette.borderLight }} />
        ) : null}

        <div className="admin-articles-panel__filters">
          <div className="admin-articles-panel__filter-group">
            <span className="admin-articles-panel__filter-tag" style={{ color: palette.textTertiary }}>
              Feed
            </span>
            <div className="admin-articles-panel__chips">
              {FEED_FILTERS.map((filter) => {
                const active = pipelineFilter === filter.id;
                const Icon = FEED_ICONS[filter.id] || Rss;
                return (
                  <button
                    key={filter.id || 'feed-all'}
                    type="button"
                    onClick={() => onFilterChange(filter.id)}
                    className="admin-articles-panel__chip"
                    style={{
                      borderColor: active ? palette.textPrimary : palette.borderLight,
                      background: active
                        ? (isDark ? 'rgba(255,255,255,0.1)' : palette.textPrimary)
                        : 'transparent',
                      color: active
                        ? (isDark ? palette.textPrimary : '#fff')
                        : palette.textSecondary,
                    }}
                  >
                    <Icon size={12} strokeWidth={active ? 2.4 : 2} />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="admin-articles-panel__filter-group admin-articles-panel__filter-group--pipe">
            <span className="admin-articles-panel__filter-tag" style={{ color: palette.textTertiary }}>
              <Workflow size={11} style={{ display: 'inline', verticalAlign: -2, marginRight: 3 }} />
              Raw
            </span>
            <div className="admin-articles-panel__chips admin-articles-panel__chips--pipe">
              {PIPELINE_FILTERS.map((filter) => {
                const active = pipelineFilter === filter.id;
                const Icon = PIPELINE_ICONS[filter.id] || Workflow;
                const statusColor = palette.pipeline?.[filter.id] || palette.textTertiary;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => onFilterChange(filter.id)}
                    className="admin-articles-panel__chip admin-articles-panel__chip--pipe"
                    style={{
                      borderColor: active ? statusColor : 'transparent',
                      background: active ? `${statusColor}${isDark ? '28' : '14'}` : 'transparent',
                      color: active ? statusColor : palette.textTertiary,
                    }}
                  >
                    <Icon size={11} strokeWidth={active ? 2.4 : 2} />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {(countDisplay.detail || helpOpen) && (
        <div
          className="admin-articles-panel__footer"
          style={{ borderTopColor: palette.borderLight, background: isDark ? 'rgba(255,255,255,0.02)' : palette.pageAlt }}
        >
          {countDisplay.detail ? (
            <p className="admin-articles-panel__detail" style={{ color: palette.textSecondary }}>
              {loading ? 'Loading…' : countDisplay.detail}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="admin-articles-panel__info"
            aria-expanded={helpOpen}
            aria-label="How review filters work"
            title={NEEDS_REVIEW_HELP}
            onClick={() => setHelpOpen((v) => !v)}
            style={{ color: palette.textTertiary }}
          >
            <Info size={14} />
          </button>
        </div>
      )}

      {helpOpen ? (
        <p
          className="admin-articles-panel__help"
          style={{
            color: palette.textSecondary,
            borderTopColor: palette.borderLight,
            background: isDark ? 'rgba(255,255,255,0.03)' : palette.pageAlt,
          }}
        >
          {NEEDS_REVIEW_HELP}
        </p>
      ) : null}
    </section>
  );
}
