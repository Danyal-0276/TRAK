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
import { TrendingUp, Flame, Zap } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    // Hide when user is actively searching
    if (searchQuery && searchQuery.trim()) return null;

    const rankedTopics = Array.isArray(topics) ? topics.slice(0, 8) : [];
    const featured = rankedTopics[0];

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
            <View style={styles.headerRow}>
                <View style={[styles.headerLeft, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}>
                    <Flame size={18} color={colors.warning} />
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Trend Radar</Text>
                </View>
                <View style={[styles.livePill, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '35' }]}>
                    <Zap size={12} color={colors.primary} />
                    <Text style={[styles.liveText, { color: colors.primary }]}>Live</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.featuredCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}
                onPress={() => onTopicPress(featured?.name)}
                activeOpacity={0.85}
            >
                <View style={styles.featuredTop}>
                    <Text style={[styles.featuredLabel, { color: colors.textSecondary }]}>Top Signal</Text>
                    <View style={[styles.rankBadge, { backgroundColor: colors.warning + '20' }]}>
                        <TrendingUp size={12} color={colors.warning} />
                        <Text style={[styles.rankBadgeText, { color: colors.warning }]}>#1</Text>
                    </View>
                </View>
                <View style={styles.featuredMiddle}>
                    <Text style={styles.featuredIcon}>{featured?.icon || "📰"}</Text>
                    <View style={styles.featuredCopy}>
                        <Text style={[styles.featuredName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {featured?.name || "Top Topic"}
                        </Text>
                        <Text style={[styles.featuredCount, { color: colors.textSecondary }]}>
                            {featured?.count || "0 in feed"}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {rankedTopics.slice(1).map((topic, index) => {
                    const rank = index + 2;
                    const momentumWidth = Math.max(22, 72 - index * 8);
                    return (
                    <TouchableOpacity
                        key={topic.id}
                        style={[styles.topicChip, {
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: colors.borderLight
                        }]}
                        onPress={() => onTopicPress(topic.name)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.chipHeader}>
                            <View style={[styles.rankCircle, { backgroundColor: colors.primary + '16' }]}>
                                <Text style={[styles.rankText, { color: colors.primary }]}>{rank}</Text>
                            </View>
                            <Text style={styles.chipIcon}>{topic.icon || "📰"}</Text>
                        </View>
                        <Text style={[styles.topicName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {topic.name || "Topic"}
                        </Text>
                        <Text style={[styles.topicCount, { color: colors.textSecondary }]}>
                            {topic.count || "0 in feed"}
                        </Text>
                        <View style={[styles.momentumTrack, { backgroundColor: colors.borderLight }]}>
                            <View
                                style={[
                                    styles.momentumBar,
                                    { width: momentumWidth, backgroundColor: topic.trending ? colors.warning : colors.primary },
                                ]}
                            />
                        </View>
                    </TouchableOpacity>
                    );
                })}
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
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: "700",
    },
    livePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    liveText: {
        fontSize: 12,
        fontWeight: "700",
    },
    featuredCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },
    featuredTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    featuredLabel: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.7,
    },
    rankBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    rankBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    featuredMiddle: {
        flexDirection: "row",
        alignItems: "center",
    },
    featuredIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    featuredCopy: {
        flex: 1,
    },
    featuredName: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 4,
    },
    featuredCount: {
        fontSize: 13,
        fontWeight: "500",
    },
    scrollContent: {
        paddingRight: 20,
    },
    topicChip: {
        borderRadius: 14,
        padding: 12,
        marginRight: 12,
        width: 136,
        borderWidth: 1,
    },
    chipHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    rankCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
    },
    rankText: {
        fontSize: 11,
        fontWeight: "700",
    },
    chipIcon: {
        fontSize: 18,
    },
    topicName: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 4,
    },
    topicCount: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 10,
    },
    momentumTrack: {
        height: 5,
        borderRadius: 999,
        overflow: "hidden",
    },
    momentumBar: {
        height: "100%",
        borderRadius: 999,
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