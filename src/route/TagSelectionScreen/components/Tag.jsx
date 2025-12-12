
// ============================================
// FILE: components/TagSelection/Tag.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function Tag({ label, isSelected, onPress, isSubTag = false }) {
    return (
        <TouchableOpacity
            style={[
                styles.tag,
                isSubTag && styles.subTag,
                isSelected && (isSubTag ? styles.selectedSubTag : styles.selectedMainTag)
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {isSelected && <View style={styles.selectionDot} />}
            <Text style={[
                styles.tagText,
                isSubTag && styles.subTagText,
                isSelected && (isSubTag ? styles.selectedSubTagText : styles.selectedMainTagText)
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tag: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0f172a',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedMainTag: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    subTag: {
        backgroundColor: '#ffffff',
        borderColor: '#64748b',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    selectedSubTag: {
        backgroundColor: '#64748b',
        borderColor: '#64748b',
    },
    selectionDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#ffffff',
        zIndex: 1,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        color: '#334155',
    },
    selectedMainTagText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    subTagText: {
        fontSize: 13,
        color: '#475569',
    },
    selectedSubTagText: {
        color: '#ffffff',
        fontWeight: '600',
    },
});