// ============================================
// FILE: components/TagSelection/ContinueButton.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

export function ContinueButton({ onPress, selectedCount, loading = false, labelPrefix = 'Continue' }) {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDisabled = selectedCount === 0 || loading;
    
    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[
                    styles.continueButton,
                    {
                        backgroundColor: isDisabled ? colors.textTertiary : colors.primary,
                        shadowColor: colors.shadowDark || '#000',
                        opacity: isDisabled ? 0.7 : 1,
                    }
                ]}
                onPress={onPress}
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
                        {labelPrefix} ({selectedCount})
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 20,
        paddingHorizontal: 4,
    },
    continueButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
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
