
// ============================================
// FILE: components/TagSelection/Tag.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

export function Tag({ label, isSelected, onPress, isSubTag = false }) {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <TouchableOpacity
            style={[
                styles.tag,
                {
                    backgroundColor: isSelected 
                        ? (isSubTag ? colors.textSecondary : colors.primary)
                        : colors.surface,
                    borderColor: isSelected 
                        ? (isSubTag ? colors.textSecondary : colors.primary)
                        : colors.border,
                    shadowColor: colors.shadowDark || '#000',
                },
                isSubTag && styles.subTag,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {isSelected && !isSubTag && (
                <View style={[styles.selectionDot, { backgroundColor: colors.success || '#22c55e', borderColor: colors.surface }]} />
            )}
            <Text style={[
                styles.tagText,
                {
                    color: isSelected 
                        ? colors.textInverse || colors.surface
                        : colors.textPrimary,
                },
                isSubTag && styles.subTagText,
                isSelected && styles.selectedTagText,
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tag: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1.5,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    subTag: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    selectionDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2.5,
        zIndex: 1,
    },
    tagText: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    subTagText: {
        fontSize: 13,
    },
    selectedTagText: {
        fontWeight: '700',
    },
});