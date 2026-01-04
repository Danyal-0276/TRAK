import React from 'react';
import Text from '../../../components/ui/Text';
import { useTheme } from '../../../theme/ThemeContext';

export function SelectedCount({ count }) {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <div style={{
            marginBottom: 20,
            textAlign: 'center',
        }}>
            <Text variant="body" color={colors.textSecondary} style={{ 
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                fontWeight: '500'
            }}>
                {count} {count === 1 ? 'tag' : 'tags'} selected
            </Text>
        </div>
    );
}


