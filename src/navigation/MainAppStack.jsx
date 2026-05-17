import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { defaultStackScreenOptions } from './stackScreenOptions';
import NotificationDetailScreen from '../route/NotificationsScreen/components/NotificationDetailScreen';
import TabNavigator from './TabNavigator.jsx';
import {
    ArticleDetailScreen,
    TrendingScreen,
    BookmarksScreen,
    RecentScreen,
    TermsScreen,
    TagSelectionScreen,
    KeywordSelectionScreen,
    CategoriesScreen,
} from './config/screenImports';

const Stack = createNativeStackNavigator();

const MainAppStack = () => (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
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

export default MainAppStack;