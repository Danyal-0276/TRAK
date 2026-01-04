import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import Text from './Text';

const Loading = ({ message = 'Loading...', size = 'medium' }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    const sizeMap = {
        small: 24,
        medium: 40,
        large: 60,
    };

    const spinnerSize = sizeMap[size] || sizeMap.medium;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            gap: 16,
        }}>
            <div
                className="spinner"
                style={{
                    width: spinnerSize,
                    height: spinnerSize,
                    border: `3px solid ${colors.border}`,
                    borderTopColor: colors.primary,
                    borderRadius: '50%',
                }}
            />
            {message && (
                <Text variant="body" color={colors.textSecondary} style={{
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                }}>
                    {message}
                </Text>
            )}
        </div>
    );
};

export default Loading;


