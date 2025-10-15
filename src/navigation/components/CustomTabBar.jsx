import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { tabBarStyles, iconMap } from '../config/tabBarConfig.js';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const renderTabIcon = (routeName, isFocused) => {
        const IconComponent = iconMap[routeName] || iconMap.Home;
        return (
            <IconComponent
                size={isFocused ? 24 : 22}
                color={isFocused ? '#000' : '#888'}
                strokeWidth={2}
            />
        );
    };

    return (
        <View style={tabBarStyles.tabBarContainer}>
            <View style={tabBarStyles.tabBarBackground}>
                <View style={tabBarStyles.tabBarContent}>
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
                                    tabBarStyles.tabItem,
                                    isFocused && tabBarStyles.tabItemActive
                                ]}
                                activeOpacity={0.7}
                            >
                                <View style={tabBarStyles.iconContainer}>
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