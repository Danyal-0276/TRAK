import React from "react";
import { TrendingUp } from "lucide-react";

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
    if (searchQuery?.trim()) return null;
    if (!topics || topics.length === 0) return null;

    return (
        <div style={{
            marginBottom: '32px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
            }}>
                <TrendingUp size={16} color="#f59e0b" />
                <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    Trending Now
                </h3>
            </div>
            <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                paddingBottom: '8px',
            }}>
                {topics.map((topic) => (
                    <button
                        key={topic.id}
                        onClick={() => onTopicPress(topic.name)}
                        style={{
                            borderRadius: '8px',
                            padding: '12px 16px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'left',
                            minWidth: '140px',
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
                        {topic.trending && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginBottom: '8px',
                            }}>
                                <TrendingUp size={12} color="#f59e0b" />
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    color: '#f59e0b',
                                    textTransform: 'uppercase',
                                }}>
                                    Trending
                                </span>
                            </div>
                        )}
                        <div style={{ 
                            fontSize: '20px', 
                            marginBottom: '6px',
                            lineHeight: '1',
                        }}>
                            {topic.icon}
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
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TrendingTopics;
