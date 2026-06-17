import React, { useRef } from 'react';
import { Flame, Zap } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';
import './TrendingTopics.css';

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const scrollRef = useRef(null);

  if (searchQuery?.trim()) return null;

  const ranked = Array.isArray(topics) ? topics.slice(0, 8) : [];
  if (ranked.length === 0) return null;

  const featured = ranked[0];
  const rest = ranked.slice(1);
  const barMuted = isDark ? colors.textTertiary : colors.textSecondary;
  const warning = colors.warning || '#f59e0b';

  return (
    <section className="trend-radar">
      <div className="trend-radar__header">
        <div className="trend-radar__badge">
          <Flame size={14} color={warning} strokeWidth={2.25} />
          <span className="trend-radar__badge-label">Trend Radar</span>
        </div>
        <div className="trend-radar__live">
          <Zap size={12} color={colors.textSecondary} strokeWidth={2.25} />
          <span className="trend-radar__live-label">Live</span>
        </div>
      </div>

      {featured ? (
        <button
          type="button"
          className="trend-radar__featured"
          onClick={() => onTopicPress(featured.name)}
        >
          <div className="trend-radar__featured-meta">
            <span className="trend-radar__featured-kicker">Top Signal</span>
            <span className="trend-radar__featured-rank">#1</span>
          </div>
          <div className="trend-radar__featured-body">
            <span className="trend-radar__featured-icon">{featured.icon || '📰'}</span>
            <div>
              <p className="trend-radar__featured-name">{featured.name}</p>
              <p className="trend-radar__featured-count">{featured.count}</p>
            </div>
          </div>
        </button>
      ) : null}

      {rest.length > 0 ? (
        <div ref={scrollRef} className="trend-radar__scroll">
          {rest.map((topic, i) => (
            <button
              key={topic.id || `${topic.name}-${i}`}
              type="button"
              className="trend-radar__card"
              onClick={() => onTopicPress(topic.name)}
            >
              <div className="trend-radar__card-top">
                <span className="trend-radar__card-rank">#{i + 2}</span>
                <span className="trend-radar__card-icon">{topic.icon || '📰'}</span>
              </div>
              <p className="trend-radar__card-name">{topic.name}</p>
              <p className="trend-radar__card-count">{topic.count}</p>
              <div className="trend-radar__progress-track">
                <div
                  className="trend-radar__progress-fill"
                  style={{
                    width: `${Math.max(24, 78 - i * 10)}%`,
                    backgroundColor: topic.trending ? warning : barMuted,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default TrendingTopics;
