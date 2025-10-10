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
                <ChevronLeft size={24} color="#1F2937" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={20} color="#1F2937" />
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
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F7F7F7',
    },
    moreButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F7F7F7',
    },
});