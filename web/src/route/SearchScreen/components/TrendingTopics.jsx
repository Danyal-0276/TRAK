import React from "react";
import { Flame, Zap } from "lucide-react";
import { useTheme } from "../../../theme/ThemeContext";

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';

    if (searchQuery?.trim()) return null;
    if (!topics || topics.length === 0) return null;

    const ranked = topics.slice(0, 8);
    const featured = ranked[0];
    const barMuted = colors.textTertiary;

    return (
        <div style={{ marginBottom: '28px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.35)' : '#fde68a'}`,
                    borderRadius: '999px',
                    padding: '6px 12px',
                    background: isDark ? 'rgba(245, 158, 11, 0.12)' : '#fffbeb',
                }}>
                    <Flame size={14} color={colors.warning || '#f59e0b'} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? (colors.warning || '#fbbf24') : '#b45309' }}>
                        Trend Radar
                    </span>
                </div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '999px',
                    padding: '5px 10px',
                    background: colors.backgroundSecondary,
                }}>
                    <Zap size={12} color={colors.textSecondary} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: colors.textSecondary }}>Live</span>
                </div>
            </div>

            {featured ? (
                <button
                    type="button"
                    onClick={() => onTopicPress(featured.name)}
                    style={{
                        width: '100%',
                        borderRadius: '12px',
                        border: `1px solid ${colors.border}`,
                        background: colors.surface,
                        padding: '12px 14px',
                        marginBottom: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: colors.textTertiary, fontWeight: 700, textTransform: 'uppercase' }}>Top Signal</span>
                        <span style={{ fontSize: 11, color: colors.warning || '#f59e0b', fontWeight: 700 }}>#1</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{featured.icon || '📰'}</span>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>{featured.name}</div>
                            <div style={{ fontSize: 12, color: colors.textSecondary }}>{featured.count}</div>
                        </div>
                    </div>
                </button>
            ) : null}

            <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '10px',
                paddingBottom: '8px',
            }}>
                {ranked.slice(1).map((topic, i) => (
                    <button
                        key={topic.id}
                        type="button"
                        onClick={() => onTopicPress(topic.name)}
                        style={{
                            borderRadius: '10px',
                            padding: '10px 12px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.surface,
                            cursor: 'pointer',
                            textAlign: 'left',
                            minWidth: '132px',
                            transition: 'border-color 0.2s ease, background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.textSecondary;
                            e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = colors.border;
                            e.currentTarget.style.backgroundColor = colors.surface;
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary }}>#{i + 2}</span>
                            <span style={{ fontSize: '16px', lineHeight: '1' }}>{topic.icon}</span>
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '4px',
                            color: colors.textPrimary,
                        }}>
                            {topic.name}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: colors.textTertiary,
                        }}>
                            {topic.count}
                        </div>
                        <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: colors.border, overflow: 'hidden' }}>
                            <div style={{
                                width: `${Math.max(24, 78 - i * 10)}%`,
                                height: '100%',
                                background: topic.trending ? (colors.warning || '#f59e0b') : barMuted,
                            }} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TrendingTopics;
