import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { defaultStackScreenOptions } from './stackScreenOptions';
import NotificationDetailScreen from '../route/NotificationsScreen/components/NotificationDetailScreen';
import TabNavigator from './TabNavigator.jsx';
import { useAuth } from '../context/AuthContext';
import {
    ArticleDetailScreen,
    TrendingScreen,
    BookmarksScreen,
    RecentScreen,
    TermsScreen,
    TagSelectionScreen,
    KeywordSelectionScreen,
    CategoriesScreen,
    AdminScreen,
    NewsFeedScreen,
} from './config/screenImports';

const Stack = createNativeStackNavigator();

const articleDetailOptions = {
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    animation: 'slide_from_right',
};

/** Admins only see the admin panel (+ article preview), not the consumer app tabs. */
function AdminAppStack() {
    return (
        <Stack.Navigator screenOptions={defaultStackScreenOptions}>
            <Stack.Screen name="AdminHome" component={AdminScreen} />
            <Stack.Screen name="NewsFeedPreview" component={NewsFeedScreen} options={{ title: 'News app' }} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={articleDetailOptions} />
        </Stack.Navigator>
    );
}

const MainAppStack = () => {
    const { isAdmin } = useAuth();
    if (isAdmin) {
        return <AdminAppStack />;
    }

    return (
        <Stack.Navigator screenOptions={defaultStackScreenOptions}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={articleDetailOptions} />
            <Stack.Screen name="Trending" component={TrendingScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="Recent" component={RecentScreen} />
            <Stack.Screen name="TermsScreen" component={TermsScreen} />
            <Stack.Screen name="TagSelection" component={TagSelectionScreen} />
            <Stack.Screen name="KeywordSelection" component={KeywordSelectionScreen} />
            <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
        </Stack.Navigator>
    );
};

export default MainAppStack;