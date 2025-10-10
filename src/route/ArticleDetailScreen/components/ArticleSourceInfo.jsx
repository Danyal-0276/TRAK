// ============================================
// FILE: components/ArticleSourceInfo.jsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock } from 'lucide-react-native';

export const ArticleSourceInfo = ({ source, time, verified }) => {
    return (
        <View style={styles.container}>
            <View style={styles.sourceIcon}>
                <Text style={styles.sourceIconText}>
                    {source.substring(0, 2).toUpperCase()}
                </Text>
            </View>
            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={styles.sourceName}>{source}</Text>
                    {verified && (
                        <CheckCircle size={14} color="#FF4500" fill="#FF4500" />
                    )}
                </View>
                <View style={styles.timeRow}>
                    <Clock size={12} color="#9CA3AF" />
                    <Text style={styles.timeText}>{time}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sourceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FF4500',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sourceIconText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    details: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    sourceName: {
        color: '#1F2937',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 6,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: '#9CA3AF',
        fontSize: 14,
        marginLeft: 4,
    },
});