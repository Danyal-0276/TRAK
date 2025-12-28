// ============================================
// FILE: components/ArticleSourceInfo.jsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const ArticleSourceInfo = ({ source, time, verified, trending }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={styles.container}>
            <View style={[
                styles.sourceIcon,
                { backgroundColor: trending ? colors.error : colors.info }
            ]}>
                <Text style={[styles.sourceIconText, { color: colors.textInverse }]}>
                    {source.substring(0, 2).toUpperCase()}
                </Text>
            </View>
            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={[styles.sourceName, { color: colors.textPrimary }]}>{source}</Text>
                    {verified && (
                        <CheckCircle size={14} color={colors.info} fill={colors.info} />
                    )}
                </View>
                <View style={styles.timeRow}>
                    <Clock size={12} color={colors.textSecondary} />
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>{time}</Text>
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
        width: 50,
        height: 50,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    sourceIconText: {
        fontSize: 16,
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
        fontSize: 16,
        fontWeight: '700',
        marginRight: 6,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
});