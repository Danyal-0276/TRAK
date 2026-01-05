// ============================================
// TrendingTopics.jsx - Trending News Topics
// ============================================
import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { TrendingUp, Flame } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    // Hide when user is actively searching
    if (searchQuery && searchQuery.trim()) return null;

    // Show empty state if no topics
    if (!topics || topics.length === 0) {
        return (
            <View style={[styles.container, { 
                backgroundColor: colors.surface,
                borderBottomColor: colors.borderLight,
            }]}>
                <View style={styles.header}>
                    <View style={[styles.iconWrapper, { backgroundColor: colors.warning + '20' }]}>
                        <Flame size={18} color={colors.warning} />
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Trending Now</Text>
                </View>
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No trending topics at the moment
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { 
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
            shadowColor: colors.shadowDark || '#000',
        }]}>
            <View style={styles.header}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.warning + '20' }]}>
                    <Flame size={18} color={colors.warning} />
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Trending Now</Text>
            </View>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {topics.map((topic) => (
                    <TouchableOpacity
                        key={topic.id}
                        style={[styles.topicCard, { 
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: colors.borderLight,
                            shadowColor: colors.shadowDark || '#000',
                        }]}
                        onPress={() => onTopicPress(topic.name)}
                        activeOpacity={0.8}
                    >
                        {topic.trending && (
                            <View style={[styles.trendingBadge, { backgroundColor: colors.warning }]}>
                                <TrendingUp size={10} color={colors.textInverse} />
                            </View>
                        )}
                        <Text style={styles.icon}>{topic.icon || '📰'}</Text>
                        <Text style={[styles.topicName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {topic.name || 'Topic'}
                        </Text>
                        <Text style={[styles.topicCount, { color: colors.textSecondary }]}>
                            {topic.count || '0 posts'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    scrollContent: {
        paddingRight: 20,
    },
    topicCard: {
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 130,
        borderWidth: 1.5,
        position: "relative",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    trendingBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        borderRadius: 12,
        padding: 5,
    },
    icon: {
        fontSize: 32,
        marginBottom: 10,
        textAlign: 'center',
    },
    topicName: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 6,
        textAlign: 'center',
    },
    topicCount: {
        fontSize: 12,
        fontWeight: "500",
        textAlign: 'center',
    },
    emptyState: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});

export default TrendingTopics;