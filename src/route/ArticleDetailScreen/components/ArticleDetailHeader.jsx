// ============================================
// FILE: components/ArticleDetailHeader.jsx
// ============================================
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, MoreHorizontal } from 'lucide-react-native';

export const ArticleDetailHeader = ({ onBackPress }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={onBackPress}
            >
                <ChevronLeft size={24} color="#0F172A" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={22} color="#64748B" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 6,
    },
    moreButton: {
        padding: 6,
    },
});