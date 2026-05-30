import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { iconMap } from '../config/tabBarConfig.js';
import { useTheme } from '../../theme/ThemeContext';
import { subscribeTabBarVisibility, resetTabBarVisibility } from '../tabBarVisibility';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { theme } = useTheme();
    const { colors, radius, spacing } = theme;
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const activePillX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);
    const tabCount = state.routes.length || 1;
    const tabWidth = contentWidth > 0 ? contentWidth / tabCount : 0;

    useEffect(() => {
        const unsubscribe = subscribeTabBarVisibility((hidden) => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: hidden ? 96 : 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: hidden ? 0 : 1,
                    duration: 160,
                    useNativeDriver: true,
                }),
            ]).start();
        });
        return unsubscribe;
    }, [opacity, translateY]);

    useEffect(() => {
        resetTabBarVisibility();
    }, [state.index]);

    useEffect(() => {
        if (!tabWidth) return;
        Animated.spring(activePillX, {
            toValue: state.index * tabWidth,
            useNativeDriver: true,
            speed: 18,
            bounciness: 10,
        }).start();
    }, [activePillX, state.index, tabWidth]);

    const isDark = theme.mode === 'dark';

    const renderTabIcon = (routeName, isFocused) => {
        const IconComponent = iconMap[routeName] || iconMap.Home;
        return (
            <IconComponent
                size={isFocused ? 24 : 22}
                color={isFocused ? (isDark ? colors.textPrimary : '#ffffff') : (isDark ? colors.textTertiary : 'rgba(255,255,255,0.55)')}
                strokeWidth={isFocused ? 2.25 : 2}
            />
        );
    };

    const styles = StyleSheet.create({
        tabBarContainer: {
            position: 'absolute',
            bottom: Math.max(insets.bottom, 20),
            left: 12,
            right: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabBarBackground: {
            width: '100%',
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.96)' : 'rgba(10, 10, 10, 0.9)',
            borderRadius: radius.pill,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            shadowColor: colors.shadowDark || '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.45 : 0.3,
            shadowRadius: 12,
            elevation: 10,
            borderWidth: 1,
            borderColor: isDark ? colors.border : 'rgba(255, 255, 255, 0.08)',
        },
        tabBarContent: {
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
        },
        activePill: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            borderRadius: radius.pill,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : '#ffffff',
        },
        tabItem: {
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    return (
        <Animated.View
            style={[
                styles.tabBarContainer,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
            pointerEvents="box-none"
        >
            <View style={styles.tabBarBackground}>
                <View
                    style={styles.tabBarContent}
                    onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
                >
                    {tabWidth > 0 ? (
                        <Animated.View
                            style={[
                                styles.activePill,
                                {
                                    width: tabWidth,
                                    transform: [{ translateX: activePillX }],
                                },
                            ]}
                        />
                    ) : null}
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
                                    styles.tabItem
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
        </Animated.View>
    );
};

export default CustomTabBar;
