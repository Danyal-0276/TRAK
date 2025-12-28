
// ============================================
// FILE: components/ArticleContent.jsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const ArticleContent = ({ category, title, content }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={styles.container}>
            {/* Category Badge */}
            <View style={[styles.categoryBadge, { 
                backgroundColor: colors.backgroundSecondary,
                borderLeftColor: colors.info 
            }]}>
                <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{category}</Text>
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

            {/* Full Content */}
            <Text style={[styles.content, { color: colors.textSecondary }]}>{content}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 4,
        borderLeftWidth: 3,
        marginBottom: 16,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: 20,
        letterSpacing: -0.4,
    },
    content: {
        fontSize: 16,
        lineHeight: 28,
        fontWeight: '400',
    },
});

