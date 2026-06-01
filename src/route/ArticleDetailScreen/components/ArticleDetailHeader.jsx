import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ChevronLeft, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import TrakLogo from '../../../components/TrakLogo';

export const ArticleDetailHeader = ({ onBackPress, onHomePress, onMorePress }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <View
            style={[
                styles.header,
                {
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.borderLight,
                    shadowColor: colors.shadowDark || '#000',
                },
            ]}
        >
            <View style={styles.leftGroup}>
                <TouchableOpacity
                    style={styles.logoButton}
                    onPress={onHomePress}
                    activeOpacity={0.7}
                    accessibilityLabel="Go to home"
                    accessibilityRole="button"
                >
                    <TrakLogo size={28} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={onBackPress}
                    activeOpacity={0.7}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.25} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={onMorePress}
                activeOpacity={0.7}
                accessibilityLabel="More options"
                accessibilityRole="button"
            >
                <MoreHorizontal size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 1,
    },
    logoButton: {
        paddingHorizontal: 4,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
});
