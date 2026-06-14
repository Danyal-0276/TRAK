import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './components/CustomTabBar.jsx';
import { useAuth } from '../context/AuthContext';
import {
    NewsFeedScreen,
    NotificationsScreen,
    ProfileScreen,
    SearchScreen,
    ChatScreen,
    AdminScreen,
} from './config/screenImports';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const { isAdmin } = useAuth();

    if (isAdmin) {
        return (
            <Tab.Navigator tabBar={() => null} screenOptions={{ headerShown: false }}>
                <Tab.Screen name="Admin" component={AdminScreen} />
            </Tab.Navigator>
        );
    }

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={NewsFeedScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} initialParams={{ embeddedInTab: true }} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;