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
    if (searchQuery.trim()) return null;

    // Don't render if no topics
    if (!topics || topics.length === 0) return null;

    return (
        <View style={[styles.container, { 
            backgroundColor: colors.surface,
            borderBottomColor: colors.border 
        }]}>
            <View style={styles.header}>
                <Flame size={18} color={colors.warning} />
                <Text style={[styles.title, { color: colors.textPrimary }]}>Trending Now</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {topics.map((topic) => (
                    <TouchableOpacity
                        key={topic.id}
                        style={[styles.topicCard, { 
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: colors.border 
                        }]}
                        onPress={() => onTopicPress(topic.name)}
                    >
                        {topic.trending && (
                            <View style={[styles.trendingBadge, { backgroundColor: colors.warning }]}>
                                <TrendingUp size={10} color={colors.textInverse} />
                            </View>
                        )}
                        <Text style={styles.icon}>{topic.icon}</Text>
                        <Text style={[styles.topicName, { color: colors.textPrimary }]}>{topic.name}</Text>
                        <Text style={[styles.topicCount, { color: colors.textSecondary }]}>{topic.count}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 8,
    },
    topicCard: {
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        width: 120,
        borderWidth: 1,
        position: "relative",
    },
    trendingBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        borderRadius: 10,
        padding: 4,
    },
    icon: {
        fontSize: 28,
        marginBottom: 8,
    },
    topicName: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 4,
    },
    topicCount: {
        fontSize: 11,
    },
});

export default TrendingTopics;