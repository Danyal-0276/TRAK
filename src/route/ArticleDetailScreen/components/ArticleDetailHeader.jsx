// ============================================
// FILE: components/ArticleDetailHeader.jsx
// ============================================
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const ArticleDetailHeader = ({ onBackPress }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={[styles.header, { 
            backgroundColor: colors.surface, 
            borderBottomColor: colors.border 
        }]}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={onBackPress}
            >
                <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={22} color={colors.textSecondary} />
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
    },
    backButton: {
        padding: 6,
    },
    moreButton: {
        padding: 6,
    },
});