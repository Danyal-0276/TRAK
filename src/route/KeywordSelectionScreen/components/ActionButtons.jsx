// ============================================
// FILE: components/KeywordSelection/ActionButtons.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function ActionButtons({ onSkip, onContinue, keywordCount }) {
    const isDisabled = keywordCount === 0;
    
    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity 
                style={styles.skipButton}
                onPress={onSkip}
                activeOpacity={0.7}
            >
                <Text style={styles.skipButtonText}>
                    Skip this step
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                    styles.continueButton,
                    isDisabled && styles.disabledButton
                ]}
                onPress={onContinue}
                disabled={isDisabled}
                activeOpacity={isDisabled ? 1 : 0.8}
            >
                <Text style={[
                    styles.continueButtonText,
                    isDisabled && styles.disabledButtonText
                ]}>
                    Continue ({keywordCount})
                </Text>
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
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#ffffff',
        marginBottom: 8,
        shadowColor: '#0f172a',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    skipButtonText: {
        color: '#475569',
        fontSize: 16,
        fontWeight: '500',
    },
    continueButton: {
        backgroundColor: '#1e293b',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#0f172a',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#e2e8f0',
        shadowOpacity: 0,
        elevation: 0,
    },
    continueButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButtonText: {
        color: '#94a3b8',
    },
});
