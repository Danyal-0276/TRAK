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

const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
    // Hide when user is actively searching
    if (searchQuery.trim()) return null;

    // Don't render if no topics
    if (!topics || topics.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Flame size={18} color="#ff6b35" />
                <Text style={styles.title}>Trending Now</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {topics.map((topic) => (
                    <TouchableOpacity
                        key={topic.id}
                        style={styles.topicCard}
                        onPress={() => onTopicPress(topic.name)}
                    >
                        {topic.trending && (
                            <View style={styles.trendingBadge}>
                                <TrendingUp size={10} color="#fff" />
                            </View>
                        )}
                        <Text style={styles.icon}>{topic.icon}</Text>
                        <Text style={styles.topicName}>{topic.name}</Text>
                        <Text style={styles.topicCount}>{topic.count}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginLeft: 8,
    },
    topicCard: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        width: 120,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        position: "relative",
    },
    trendingBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#ff6b35",
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
        color: "#0F172A",
        marginBottom: 4,
    },
    topicCount: {
        fontSize: 11,
        color: "#64748B",
    },
});

export default TrendingTopics;