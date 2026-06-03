import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ChevronLeft, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import TrakLogo from '../../../components/TrakLogo';

const SIDE_SLOT_WIDTH = 40;

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
            <View style={styles.sideSlot}>
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

            <View style={styles.centerSlot}>
                <TouchableOpacity
                    style={styles.logoButton}
                    onPress={onHomePress}
                    activeOpacity={0.7}
                    accessibilityLabel="Go to home"
                    accessibilityRole="button"
                >
                    <TrakLogo size={28} />
                </TouchableOpacity>
            </View>

            <View style={[styles.sideSlot, styles.sideSlotRight]}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
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
    sideSlot: {
        width: SIDE_SLOT_WIDTH,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    sideSlotRight: {
        alignItems: 'flex-end',
    },
    centerSlot: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoButton: {
        paddingHorizontal: 4,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        width: SIDE_SLOT_WIDTH,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
