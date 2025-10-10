// ============================================
// FILE: components/ArticleContent.jsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ArticleContent = ({ category, title, content }) => {
    return (
        <View style={styles.container}>
            {/* Category Badge */}
            <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Full Content */}
            <Text style={styles.content}>{content}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
    },
    categoryText: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        color: '#1F2937',
        fontSize: 26,
        fontWeight: '800',
        lineHeight: 34,
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    content: {
        color: '#374151',
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'justify',
    },
});