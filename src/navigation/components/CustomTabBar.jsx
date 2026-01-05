import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { iconMap } from '../config/tabBarConfig.js';
import { useTheme } from '../../theme/ThemeContext';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { theme } = useTheme();
    const { colors, radius, spacing } = theme;
    const insets = useSafeAreaInsets();

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

    const styles = StyleSheet.create({
        tabBarContainer: {
            position: 'absolute',
            bottom: Math.max(insets.bottom, 20),
            left: 20,
            right: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabBarBackground: {
            backgroundColor: theme.mode === 'dark' 
                ? 'rgba(15, 23, 42, 0.8)' 
                : 'rgba(0, 0, 0, 0.8)',
            borderRadius: radius.pill,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            shadowColor: colors.shadow || '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
            borderWidth: 1,
            borderColor: theme.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
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
