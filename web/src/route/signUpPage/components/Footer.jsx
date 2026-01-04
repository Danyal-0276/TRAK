import React from 'react';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export const Footer = ({ onSignInPress }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 8,
        }}>
            <Text variant="caption" color={colors.textSecondary} style={{ fontSize: 14, fontWeight: '400' }}>
                Already have an account?{' '}
            </Text>
            <button
                onClick={onSignInPress}
                style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                }}
            >
                <Text variant="caption" color={colors.primary} style={{ fontSize: 14, fontWeight: '700', letterSpacing: -0.2 }}>
                    Sign in
                </Text>
            </button>
        </div>
    );
};

