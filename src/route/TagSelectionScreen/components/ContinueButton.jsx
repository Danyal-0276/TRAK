// ============================================
// FILE: components/TagSelection/ContinueButton.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function ContinueButton({ onPress, selectedCount }) {
    const isDisabled = selectedCount === 0;
    
    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[
                    styles.continueButton,
                    isDisabled && styles.disabledButton
                ]}
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={isDisabled ? 1 : 0.8}
            >
                <Text style={[
                    styles.continueButtonText,
                    isDisabled && styles.disabledButtonText
                ]}>
                    Continue ({selectedCount})
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    continueButton: {
        backgroundColor: '#1e293b',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
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
