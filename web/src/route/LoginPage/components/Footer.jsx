import React from 'react';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export const Footer = ({ onSignUpPress }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 16,
        }}>
            <Text variant="caption" color={colors.textSecondary} style={{ fontSize: 14, fontWeight: '400' }}>
                Don't have an account?{' '}
            </Text>
            <button
                onClick={onSignUpPress}
                style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                }}
            >
                <Text variant="caption" color={colors.textLink || colors.textPrimary} style={{ fontSize: 14, fontWeight: '700', letterSpacing: -0.2 }}>
                    Sign up
                </Text>
            </button>
        </div>
    );
};

