// ============================================
// FILE: components/ArticleDetailHeader.jsx
// ============================================
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ChevronLeft, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const ArticleDetailHeader = ({ onBackPress }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={[
            styles.header, 
            { 
                backgroundColor: colors.surface, 
                borderBottomColor: colors.borderLight,
                shadowColor: colors.shadowDark || '#000',
            }
        ]}>
            <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={onBackPress}
                activeOpacity={0.7}
            >
                <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.moreButton, { backgroundColor: colors.backgroundSecondary }]}
                activeOpacity={0.7}
            >
                <MoreHorizontal size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});