import React from 'react';
import Text from '../../../components/ui/Text';
import { useTheme } from '../../../theme/ThemeContext';

export function EmptyState() {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px',
        }}>
            <Text variant="body" color={colors.textPrimary} style={{ 
                fontSize: 'clamp(16px, 4vw, 18px)',
                fontWeight: '600',
                marginBottom: 8,
            }}>
                No keywords added yet
            </Text>
            <Text variant="body" color={colors.textSecondary} style={{ 
                fontSize: 'clamp(13px, 3vw, 14px)',
                textAlign: 'center',
            }}>
                Add keywords above to see them here
            </Text>
        </div>
    );
}


