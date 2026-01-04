import React from "react";
import { Clock, X } from "lucide-react";

const RecentSearches = ({ searches, onSearchSelect, onDeleteSearch, searchQuery }) => {
    if (searchQuery?.trim()) return null;
    if (!searches || searches.length === 0) return null;

    return (
        <div style={{
            marginBottom: '32px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
            }}>
                <Clock size={14} color="#64748b" />
                <h3 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#0f172a',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    Recent Searches
                </h3>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}>
                {searches.map((item) => (
                    <div key={item.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    >
                        <button
                            onClick={() => onSearchSelect(item.query)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                gap: '12px',
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#0f172a',
                                    marginBottom: '2px',
                                }}>
                                    {item.query}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#9ca3af',
                                }}>
                                    {item.time}
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => onDeleteSearch(item.id)}
                            style={{
                                padding: '4px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <X size={14} color="#9ca3af" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentSearches;
