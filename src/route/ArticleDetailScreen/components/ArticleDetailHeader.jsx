import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const ArticleDetailHeader = ({ onMorePress }) => {
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
            <TouchableOpacity
                style={[styles.moreButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={onMorePress}
                activeOpacity={0.7}
                accessibilityLabel="More options"
            >
                <MoreHorizontal size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
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
    moreButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
