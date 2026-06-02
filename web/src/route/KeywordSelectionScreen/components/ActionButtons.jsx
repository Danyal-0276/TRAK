import React from 'react';
import Button from '../../../components/ui/Button';
import Text from '../../../components/ui/Text';
import { useTheme } from '../../../theme/ThemeContext';

export function ActionButtons({ onSkip, onContinue, keywordCount }) {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDisabled = keywordCount === 0;
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
                onClick={onSkip}
                style={{
                    padding: '16px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    marginBottom: 8,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                }}
            >
                <Text variant="body" color={colors.textSecondary} style={{ 
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: '500'
                }}>
                    Skip this step
                </Text>
            </button>

            <Button
                title={`Continue (${keywordCount})`}
                variant="primary"
                onPress={onContinue}
                disabled={isDisabled}
                style={{
                    width: '100%',
                    marginBottom: 30,
                    opacity: isDisabled ? 0.6 : 1,
                    backgroundColor: isDisabled ? colors.border : undefined,
                }}
            />
        </div>
    );
}


