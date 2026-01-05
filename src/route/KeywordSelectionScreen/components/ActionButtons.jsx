// ============================================
// FILE: components/KeywordSelection/ActionButtons.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

export function ActionButtons({ onSkip, onContinue, keywordCount, loading = false }) {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDisabled = keywordCount === 0 || loading;
    
    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity 
                style={[
                    styles.skipButton,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        shadowColor: colors.shadowDark || '#000',
                    }
                ]}
                onPress={onSkip}
                activeOpacity={0.7}
                disabled={loading}
            >
                <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                    Skip this step
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                    styles.continueButton,
                    {
                        backgroundColor: isDisabled ? colors.textTertiary : colors.primary,
                        shadowColor: colors.shadowDark || '#000',
                        opacity: isDisabled ? 0.7 : 1,
                    }
                ]}
                onPress={onContinue}
                disabled={isDisabled}
                activeOpacity={0.8}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator 
                            size="small" 
                            color={colors.textInverse || colors.surface}
                            style={styles.spinner}
                        />
                        <Text style={[styles.continueButtonText, { color: colors.textInverse || colors.surface }]}>
                            Loading...
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.continueButtonText, { color: colors.textInverse || colors.surface }]}>
                        Continue ({keywordCount})
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonsContainer: {
        gap: 12,
    },
    skipButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        marginBottom: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    skipButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    continueButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 30,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        marginRight: 10,
    },
});
