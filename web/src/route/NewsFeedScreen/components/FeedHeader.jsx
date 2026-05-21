import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';
import TrakLogo from '../../../components/TrakLogo';

export const FeedHeader = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    return (
        <div style={{
            background: 'var(--trak-bg)',
            borderBottom: '1px solid #e2e8f0',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 32px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <TrakLogo size={36} variant="auto" />
                    <Text variant="body" style={{
                        fontSize: '18px',
                        fontWeight: '400',
                        color: '#374151',
                        letterSpacing: '0.2px',
                    }}>
                        Newsfeed
                    </Text>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <button
                        onClick={() => navigate('/settings')}
                        style={{
                            padding: '10px',
                            borderRadius: '12px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <Settings size={20} color="#64748b" strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>
    );
};
