import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { iconMap } from '../config/tabBarConfig.js';
import { useTheme } from '../../theme/ThemeContext';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { theme } = useTheme();
    const { colors, radius, spacing } = theme;
    const styles = StyleSheet.create({
        tabBarContainer: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabBarBackground: {
            backgroundColor: colors.textPrimary,
            borderRadius: radius.pill,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        tabBarContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.xs,
        },
        tabItem: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabItemActive: {
            backgroundColor: colors.surface,
        },
        iconContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
    const renderTabIcon = (routeName, isFocused) => {
        const IconComponent = iconMap[routeName] || iconMap.Home;
        return (
            <IconComponent
                size={isFocused ? 24 : 22}
                color={isFocused ? colors.textPrimary : colors.textSecondary}
                strokeWidth={2}
            />
        );
    };

    return (
        <View style={styles.tabBarContainer}>
            <View style={styles.tabBarBackground}>
                <View style={styles.tabBarContent}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                            });
                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={[
                                    styles.tabItem,
                                    isFocused && styles.tabItemActive
                                ]}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconContainer}>
                                    {renderTabIcon(route.name, isFocused)}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

export default CustomTabBar;
