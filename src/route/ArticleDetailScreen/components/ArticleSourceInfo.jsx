// ============================================
// FILE: components/ArticleSourceInfo.jsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const ArticleSourceInfo = ({ source, time, verified, trending, readTime }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const sourceLabel = String(source || 'News').trim() || 'News';

    return (
        <View style={styles.container}>
            <View style={[
                styles.sourceIcon,
                { backgroundColor: trending ? colors.primary : colors.textSecondary }
            ]}>
                <Text style={[styles.sourceIconText, { color: colors.textInverse }]}>
                    {sourceLabel.substring(0, 2).toUpperCase()}
                </Text>
            </View>
            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={[styles.sourceName, { color: colors.textPrimary }]}>{sourceLabel}</Text>
                    {verified && (
                        <CheckCircle size={14} color={colors.verified || colors.info} fill={colors.verified || colors.info} />
                    )}
                </View>
                <View style={styles.timeRow}>
                    <Clock size={12} color={colors.textSecondary} />
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>{time}</Text>
                    {readTime && (
                        <>
                            <Text style={[styles.dot, { color: colors.textTertiary }]}>•</Text>
                            <Text style={[styles.readTime, { color: colors.textSecondary }]}>{readTime} min read</Text>
                        </>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sourceIcon: {
        width: 44,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sourceIconText: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    details: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    sourceName: {
        fontSize: 15,
        fontWeight: '700',
        marginRight: 6,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 4,
    },
    dot: {
        fontSize: 13,
        marginHorizontal: 6,
    },
    readTime: {
        fontSize: 13,
        fontWeight: '500',
    },
});