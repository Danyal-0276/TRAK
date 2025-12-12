
// ============================================
// FILE: components/KeywordSelection/EmptyState.jsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function EmptyState() {
    return (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
                No keywords added yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
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
    },
    emptyStateText: {
        fontSize: 18,
        color: '#334155',
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
});