// ============================================
// FILE: components/ArticleSourceInfo.jsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, Clock } from 'lucide-react-native';

export const ArticleSourceInfo = ({ source, time, verified, trending }) => {
    return (
        <View style={styles.container}>
            <View style={[
                styles.sourceIcon,
                { backgroundColor: trending ? '#DC2626' : '#1E40AF' }
            ]}>
                <Text style={styles.sourceIconText}>
                    {source.substring(0, 2).toUpperCase()}
                </Text>
            </View>
            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={styles.sourceName}>{source}</Text>
                    {verified && (
                        <CheckCircle size={14} color="#2563EB" fill="#2563EB" />
                    )}
                </View>
                <View style={styles.timeRow}>
                    <Clock size={12} color="#64748B" />
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
        color: '#FFFFFF',
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
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 6,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
});