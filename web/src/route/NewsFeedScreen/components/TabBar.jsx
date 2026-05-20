import React from 'react';
import { TrendingUp, Bookmark } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export const TabBar = ({ activeTab, setActiveTab }) => {
    const { theme } = useTheme();
    
    const tabItems = [
        { name: 'For you', icon: null },
        { name: 'Following', icon: null },
        { name: 'Trending', icon: TrendingUp },
        { name: 'Bookmarks', icon: Bookmark },
    ];

    return (
        <div style={{
            background: 'var(--trak-bg)',
            padding: '0',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                gap: '0',
            }}>
                {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.name;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 24px',
                                borderRadius: '0',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '2px solid #000000' : '2px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                gap: '8px',
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
                            {Icon && (
                                <Icon
                                    size={16}
                                    color={isActive ? '#000000' : '#64748b'}
                                    strokeWidth={2.5}
                                />
                            )}
                            <Text variant="body" style={{
                                color: isActive ? '#000000' : '#64748b',
                                fontSize: '15px',
                                fontWeight: isActive ? '600' : '500',
                            }}>
                                {tab.name}
                            </Text>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
