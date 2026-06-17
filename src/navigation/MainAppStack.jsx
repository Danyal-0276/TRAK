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
    ReactionArticlesScreen,
    RecentScreen,
    PicsScreen,
    TermsScreen,
    TagSelectionScreen,
    KeywordSelectionScreen,
    CategoriesScreen,
    BrowseCategoriesScreen,
    CategoryArticlesScreen,
    AdminScreen,
    NewsFeedScreen,
    EditProfileScreen,
    SettingsScreen,
    PrivacyScreen,
    DataScreen,
    AboutScreen,
} from './config/screenImports';

const Stack = createNativeStackNavigator();

const articleDetailOptions = {
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    animation: 'slide_from_right',
    presentation: 'card',
};

/** Admins only see the admin panel (+ article preview), not the consumer app tabs. */
function AdminAppStack() {
    return (
        <Stack.Navigator screenOptions={defaultStackScreenOptions}>
            <Stack.Screen name="AdminHome" component={AdminScreen} />
            <Stack.Screen name="NewsFeedPreview" component={NewsFeedScreen} options={{ title: 'News app' }} />
            <Stack.Screen name="PicsPreview" component={PicsScreen} options={{ title: 'Pics app' }} />
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
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
            {/* Settings hub + all settings sub-flows on one stack for reliable swipe/back */}
            <Stack.Screen name="SettingsHome" component={SettingsScreen} />
            <Stack.Screen
                name="SettingsBrowseCategories"
                component={BrowseCategoriesScreen}
                initialParams={{ fromSettings: true }}
            />
            <Stack.Screen name="SettingsCategoryArticles" component={CategoryArticlesScreen} />
            <Stack.Screen name="SettingsTagSelection" component={TagSelectionScreen} />
            <Stack.Screen name="SettingsKeywordSelection" component={KeywordSelectionScreen} />
            <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
            <Stack.Screen name="DataScreen" component={DataScreen} />
            <Stack.Screen name="AboutScreen" component={AboutScreen} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={articleDetailOptions} />
            <Stack.Screen name="Trending" component={TrendingScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="ReactionArticles" component={ReactionArticlesScreen} />
            <Stack.Screen name="Recent" component={RecentScreen} />
            <Stack.Screen name="Pics" component={PicsScreen} />
            <Stack.Screen name="TermsScreen" component={TermsScreen} />
            <Stack.Screen name="TagSelection" component={TagSelectionScreen} />
            <Stack.Screen name="KeywordSelection" component={KeywordSelectionScreen} />
            <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
            <Stack.Screen name="BrowseCategories" component={BrowseCategoriesScreen} />
            <Stack.Screen name="CategoryArticles" component={CategoryArticlesScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
        </Stack.Navigator>
    );
};

export default MainAppStack;
