// ============================================
// FILE: components/KeywordSelection/KeywordCount.jsx
// ============================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export function KeywordCount({ count }) {
    const { theme } = useTheme();
    const { colors } = theme;
    
    if (count === 0) return null;
    
    return (
        <View style={[styles.badge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Text variant="caption" color={colors.primary} style={styles.selectedCount}>
                {count} {count === 1 ? 'keyword' : 'keywords'} added
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        alignSelf: 'center',
        marginBottom: 20,
    },
    selectedCount: {
        fontSize: 14,
        fontWeight: '600',
    },
});