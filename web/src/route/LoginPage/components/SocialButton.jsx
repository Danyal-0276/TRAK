import React from 'react';
import { useTheme } from '../../../theme/ThemeContext';

export const SocialButton = ({ iconSource, onPress, style, loading }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <button
            onClick={onPress}
            disabled={loading}
            style={{
                width: 'clamp(48px, 12vw, 56px)',
                height: 'clamp(48px, 12vw, 56px)',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                backgroundColor: colors.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${colors.border}`,
                boxShadow: `0 2px 4px ${colors.shadow}`,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                ...style
            }}
        >
            {loading ? (
                <div style={{ width: 20, height: 20, border: `2px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
                iconSource && (
                    <img
                        src={iconSource}
                        alt="Social icon"
                        style={{
                            width: 'clamp(20px, 5vw, 24px)',
                            height: 'clamp(20px, 5vw, 24px)',
                            objectFit: 'contain'
                        }}
                    />
                )
            )}
        </button>
    );
};

