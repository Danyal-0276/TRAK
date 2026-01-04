import React from "react";

const Tabs = ({ categories, activeTab, onTabPress }) => {
    return (
        <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '32px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '0',
        }}>
            {categories.map((cat) => {
                const isActive = activeTab === cat;
                return (
                    <button
                        key={cat}
                        onClick={() => onTabPress(cat)}
                        style={{
                            padding: '10px 16px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderBottom: isActive ? '2px solid #0f172a' : '2px solid transparent',
                            marginBottom: '-1px',
                            borderRadius: '0',
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        <span style={{
                            fontSize: '14px',
                            fontWeight: isActive ? '600' : '500',
                            color: isActive ? '#0f172a' : '#64748b',
                        }}>
                            {cat}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default Tabs;
