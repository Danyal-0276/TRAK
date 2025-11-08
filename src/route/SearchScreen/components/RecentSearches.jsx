// ============================================
// RecentSearches.jsx - Recent Search History
// ============================================
import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Clock, X } from "lucide-react-native";

const RecentSearches = ({ searches, onSearchSelect, onDeleteSearch, searchQuery }) => {
    // Hide when user is actively searching
    if (searchQuery.trim()) return null;

    // Don't render if no searches
    if (!searches || searches.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.title}>Recent Searches</Text>
            </View>
            {searches.map((item) => (
                <View key={item.id} style={styles.item}>
                    <TouchableOpacity
                        style={styles.itemLeft}
                        onPress={() => onSearchSelect(item.query)}
                    >
                        <Text style={styles.icon}>{item.icon}</Text>
                        <Text style={styles.query}>{item.query}</Text>
                    </TouchableOpacity>
                    <View style={styles.itemRight}>
                        <Text style={styles.time}>{item.time}</Text>
                        <TouchableOpacity
                            onPress={() => onDeleteSearch(item.id)}
                            style={styles.deleteButton}
                        >
                            <X size={14} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
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
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginLeft: 8,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#E2E8F0",
    },
    itemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    itemRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    icon: {
        fontSize: 18,
        marginRight: 12,
    },
    query: {
        fontSize: 14,
        color: "#0F172A",
        fontWeight: "500",
        flex: 1,
    },
    time: {
        fontSize: 12,
        color: "#94A3B8",
    },
    deleteButton: {
        padding: 4,
    },
});

export default RecentSearches;