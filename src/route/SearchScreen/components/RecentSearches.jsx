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
import { useTheme } from "../../../theme/ThemeContext";

const RecentSearches = ({ searches, onSearchSelect, onDeleteSearch, searchQuery }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    // Hide when user is actively searching
    if (searchQuery.trim()) return null;

    // Don't render if no searches
    if (!searches || searches.length === 0) return null;

    return (
        <View style={[styles.container, { 
            backgroundColor: colors.surface,
            borderBottomColor: colors.border 
        }]}>
            <View style={styles.header}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[styles.title, { color: colors.textPrimary }]}>Recent Searches</Text>
            </View>
            {searches.map((item) => (
                <View key={item.id} style={[styles.item, { borderBottomColor: colors.borderLight }]}>
                    <TouchableOpacity
                        style={styles.itemLeft}
                        onPress={() => onSearchSelect(item.query)}
                    >
                        <Text style={styles.icon}>{item.icon}</Text>
                        <Text style={[styles.query, { color: colors.textPrimary }]}>{item.query}</Text>
                    </TouchableOpacity>
                    <View style={styles.itemRight}>
                        <Text style={[styles.time, { color: colors.textTertiary }]}>{item.time}</Text>
                        <TouchableOpacity
                            onPress={() => onDeleteSearch(item.id)}
                            style={styles.deleteButton}
                        >
                            <X size={14} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
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
        fontSize: 14,
        fontWeight: "700",
        marginLeft: 8,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 0.5,
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
        fontWeight: "500",
        flex: 1,
    },
    time: {
        fontSize: 12,
    },
    deleteButton: {
        padding: 4,
    },
});

export default RecentSearches;