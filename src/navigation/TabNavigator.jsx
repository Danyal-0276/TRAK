import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './components/CustomTabBar.jsx';
import {
    NewsFeedScreen,
    NotificationsScreen,
    ProfileScreen,
    SearchScreen,
    SettingsScreen,
} from './config/screenImports';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
    <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
    >
        <Tab.Screen name="Home" component={NewsFeedScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
);

export default TabNavigator;