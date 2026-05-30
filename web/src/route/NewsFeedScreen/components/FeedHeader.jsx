import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../theme/ThemeContext';
import TrakLogo from '../../../components/TrakLogo';
import Text from '../../../components/ui/Text';

export const FeedHeader = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigate = useNavigate();

    return (
        <div style={{
            backgroundColor: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
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
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.backgroundSecondary,
                    }}>
                        <TrakLogo size={24} />
                    </div>
                    <Text variant="body" style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        letterSpacing: '0.2px',
                    }}>
                        Newsfeed
                    </Text>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    style={{
                        padding: '10px',
                        borderRadius: '12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <Settings size={20} color={colors.textSecondary} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};
