// ============================================
// FILE: components/TabBar.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TrendingUp, Bookmark } from 'lucide-react-native';

export const TabBar = ({ activeTab, setActiveTab }) => {
    const tabItems = [
        { name: 'For you', icon: null },
        { name: 'Following', icon: null },
        { name: 'Trending', icon: TrendingUp },
        { name: 'Bookmarks', icon: Bookmark },
    ];

    return (
        <View style={tabStyles.container}>
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
                                isActive && tabStyles.activeTab
                            ]}
                            onPress={() => setActiveTab(tab.name)}
                            activeOpacity={0.7}
                        >
                            {Icon && (
                                <Icon
                                    size={14}
                                    color={isActive ? '#FF4500' : '#6B7280'}
                                    style={tabStyles.icon}
                                    strokeWidth={2.5}
                                />
                            )}
                            <Text style={[
                                tabStyles.text,
                                isActive && tabStyles.activeText
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
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    scroll: {
        paddingHorizontal: 16,
    },
    content: {
        alignItems: 'center',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    activeTab: {
        backgroundColor: '#FFF5F0',
    },
    icon: {
        marginRight: 4,
    },
    text: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
    },
    activeText: {
        color: '#FF4500',
        fontWeight: '700',
    },
});