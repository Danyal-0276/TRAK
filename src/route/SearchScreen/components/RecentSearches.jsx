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
    if (searchQuery && searchQuery.trim()) return null;

    return (
        <View style={[styles.container, { 
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
        }]}>
            <View style={styles.header}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
                    <Clock size={16} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Recent Searches</Text>
            </View>
            {searches && Array.isArray(searches) && searches.length > 0 ? (
                searches.map((item) => (
                    <View key={item.id} style={[styles.item, { borderBottomColor: colors.borderLight }]}>
                        <TouchableOpacity
                            style={styles.itemLeft}
                            onPress={() => onSearchSelect && onSearchSelect(item.query)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                                <Text style={styles.icon}>{item.icon || '🔍'}</Text>
                            </View>
                            <Text style={[styles.query, { color: colors.textPrimary }]} numberOfLines={1}>
                                {item.query || 'Search'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.itemRight}>
                            <Text style={[styles.time, { color: colors.textTertiary }]}>
                                {item.time || 'Just now'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => onDeleteSearch && onDeleteSearch(item.id)}
                                style={[styles.deleteButton, { backgroundColor: colors.backgroundSecondary }]}
                                activeOpacity={0.7}
                            >
                                <X size={14} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No recent searches
                    </Text>
                </View>
            )}
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
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
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
        gap: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
        textAlign: 'center',
    },
    query: {
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
        marginLeft: 4,
    },
    time: {
        fontSize: 12,
        fontWeight: "500",
    },
    deleteButton: {
        padding: 8,
        borderRadius: 16,
    },
    emptyState: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});

export default RecentSearches;