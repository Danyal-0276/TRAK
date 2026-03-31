import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationDetailScreen from '../route/NotificationsScreen/components/NotificationDetailScreen';
import TabNavigator from './TabNavigator.jsx';
import { ArticleDetailScreen, TrendingScreen, BookmarksScreen, RecentScreen, TermsScreen } from './config/screenImports';

const Stack = createNativeStackNavigator();

const MainAppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
        <Stack.Screen name="Trending" component={TrendingScreen} />
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
        <Stack.Screen name="Recent" component={RecentScreen} />
        <Stack.Screen name="TermsScreen" component={TermsScreen} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
    </Stack.Navigator>
);

export default MainAppStack;