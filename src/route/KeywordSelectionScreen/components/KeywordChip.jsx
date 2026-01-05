
// ============================================
// FILE: components/KeywordSelection/KeywordChip.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export function KeywordChip({ keyword, onRemove }) {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={[
            styles.keyword,
            {
                backgroundColor: colors.primary,
                shadowColor: colors.shadowDark || '#000',
            }
        ]}>
            <Text style={[styles.keywordText, { color: colors.textInverse || colors.surface }]}>
                {keyword}
            </Text>
            <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.textInverse + '30' || 'rgba(255, 255, 255, 0.3)' }]}
                onPress={onRemove}
                activeOpacity={0.7}
            >
                <X size={14} color={colors.textInverse || colors.surface} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    keyword: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    keywordText: {
        fontSize: 15,
        fontWeight: '600',
        marginRight: 10,
    },
    removeButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
});