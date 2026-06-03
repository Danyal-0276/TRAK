import React from 'react';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../theme/ThemeContext';

export function ContinueButton({ onPress, selectedCount }) {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDisabled = selectedCount === 0;

    return (
        <div style={{ marginTop: 20, padding: '0 10px' }}>
            <Button
                title={`Continue (${selectedCount})`}
                variant="primary"
                onPress={onPress}
                disabled={isDisabled}
                style={{
                    width: '100%',
                    opacity: isDisabled ? 0.6 : 1,
                    backgroundColor: isDisabled ? colors.border : undefined,
                }}
            />
        </div>
    );
}


