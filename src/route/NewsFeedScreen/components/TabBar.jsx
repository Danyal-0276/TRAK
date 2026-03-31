// ============================================
// FILE: components/TabBar.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TrendingUp, Bookmark, Clock } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const TabBar = ({ activeTab, setActiveTab, navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    const tabItems = [
        { name: 'For you', icon: null, stackScreen: null },
        { name: 'Following', icon: null, stackScreen: null },
        { name: 'Trending', icon: TrendingUp, stackScreen: 'Trending' },
        { name: 'Bookmarks', icon: Bookmark, stackScreen: 'Bookmarks' },
        { name: 'Recent', icon: Clock, stackScreen: 'Recent' },
    ];

    return (
        <View style={[tabStyles.container, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={tabStyles.scroll}
                contentContainerStyle={tabStyles.content}
            >
                {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.name;
                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={[
                                tabStyles.tab,
                                {
                                    backgroundColor: isActive ? colors.primary + '15' : 'transparent',
                                }
                            ]}
                            onPress={() => {
                                if (tab.stackScreen && navigation) {
                                    navigation.getParent()?.navigate(tab.stackScreen);
                                    return;
                                }
                                setActiveTab(tab.name);
                            }}
                            activeOpacity={0.7}
                        >
                            {Icon && (
                                <Icon
                                    size={14}
                                    color={isActive ? colors.primary : colors.textSecondary}
                                    style={tabStyles.icon}
                                    strokeWidth={2.5}
                                />
                            )}
                            <Text style={[
                                tabStyles.text,
                                {
                                    color: isActive ? colors.primary : colors.textSecondary,
                                    fontWeight: isActive ? '700' : '600',
                                }
                            ]}>
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const tabStyles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    scroll: {
        paddingHorizontal: 20,
    },
    content: {
        alignItems: 'center',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
    },
    icon: {
        marginRight: 6,
    },
    text: {
        fontSize: 15,
    },
});