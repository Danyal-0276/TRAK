
// ============================================
// FILE: components/KeywordSelection/EmptyState.jsx
// ============================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export function EmptyState() {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={styles.emptyState}>
            <Text variant="subtitle" color={colors.textPrimary} style={styles.emptyStateText}>
                No keywords added yet
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.emptyStateSubtext}>
                Add keywords above to see them here
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        width: '100%',
    },
    emptyStateText: {
        marginBottom: 8,
    },
    emptyStateSubtext: {
        textAlign: 'center',
    },
});