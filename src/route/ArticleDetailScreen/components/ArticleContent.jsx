
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
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#2563EB',
        marginBottom: 16,
    },
    categoryText: {
        color: '#334155',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    title: {
        color: '#0F172A',
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: 20,
        letterSpacing: -0.4,
    },
    content: {
        color: '#475569',
        fontSize: 16,
        lineHeight: 28,
        fontWeight: '400',
    },
});

