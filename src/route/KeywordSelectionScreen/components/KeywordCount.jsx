// ============================================
// FILE: components/KeywordSelection/KeywordCount.jsx
// ============================================
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export function KeywordCount({ count }) {
    if (count === 0) return null;
    
    return (
        <Text style={styles.selectedCount}>
            {count} keywords added
        </Text>
    );
}

const styles = StyleSheet.create({
    selectedCount: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500',
    },
});