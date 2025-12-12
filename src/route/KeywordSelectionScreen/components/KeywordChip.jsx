
// ============================================
// FILE: components/KeywordSelection/KeywordChip.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

export function KeywordChip({ keyword, onRemove }) {
    return (
        <View style={styles.keyword}>
            <Text style={styles.keywordText}>
                {keyword}
            </Text>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={onRemove}
                activeOpacity={0.7}
            >
                <X size={14} color="#ffffff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    keyword: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        marginBottom: 12,
        alignSelf: 'flex-start',
        shadowColor: '#2563eb',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    keywordText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
    },
    removeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});