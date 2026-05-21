import React from "react";
import { TrendingUp, Flame, Zap } from "lucide-react";

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
    if (searchQuery?.trim()) return null;
    if (!topics || topics.length === 0) return null;

    const ranked = topics.slice(0, 8);
    const featured = ranked[0];
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
                    border: '1px solid #fde68a',
                    borderRadius: '999px',
                    padding: '6px 12px',
                    background: '#fffbeb',
                }}>
                    <Flame size={14} color="#d97706" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Trend Radar</span>
                </div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid #bfdbfe',
                    borderRadius: '999px',
                    padding: '5px 10px',
                    background: '#eff6ff',
                }}>
                    <Zap size={12} color="#2563eb" />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>Live</span>
                </div>
            </div>

            {featured ? (
                <button
                    onClick={() => onTopicPress(featured.name)}
                    style={{
                        width: '100%',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        padding: '12px 14px',
                        marginBottom: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Top Signal</span>
                        <span style={{ fontSize: 11, color: '#d97706', fontWeight: 700 }}>#1</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{featured.icon || '📰'}</span>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{featured.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{featured.count}</div>
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
                        onClick={() => onTopicPress(topic.name)}
                        style={{
                            borderRadius: '10px',
                            padding: '10px 12px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            minWidth: '132px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#0f172a';
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>#{i + 2}</span>
                            <span style={{ fontSize: '16px', lineHeight: '1' }}>{topic.icon}</span>
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '4px',
                            color: '#0f172a',
                        }}>
                            {topic.name}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#64748b',
                        }}>
                            {topic.count}
                        </div>
                        <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
                            <div style={{
                                width: `${Math.max(24, 78 - i * 10)}%`,
                                height: '100%',
                                background: topic.trending ? '#f59e0b' : '#3b82f6',
                            }} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TrendingTopics;
