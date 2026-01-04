
// ============================================
// FILE: components/ArticleContent.jsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import TextComponent from '../../../components/ui/Text';

export const ArticleContent = ({ category, title, content }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={styles.container}>
            {/* Category Badge */}
            <View style={[styles.categoryBadge, { 
                backgroundColor: colors.primary + '15',
                borderLeftColor: colors.primary 
            }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>{category}</Text>
            </View>

            {/* Title */}
            <TextComponent variant="title" style={[styles.title, { color: colors.textPrimary }]}>
                {title}
            </TextComponent>

            {/* Full Content */}
            <TextComponent variant="body" style={[styles.content, { color: colors.textSecondary }]}>
                {content}
            </TextComponent>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        marginBottom: 24,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 38,
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    content: {
        fontSize: 17,
        lineHeight: 30,
        fontWeight: '400',
    },
});

