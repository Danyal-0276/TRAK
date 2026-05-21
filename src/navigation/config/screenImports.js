import React from 'react';
import { View, Text } from 'react-native';

// MANDATORY SCREENS - Import directly
import LoginScreen from '../../route/LoginPage/LoginScreen.jsx';
import SignUpScreen from '../../route/signUpPage/SignUpSCreen.jsx';
import ForgotPasswordScreen from '../../route/forgotPasswordPage/ForgotPasswordScreen.jsx';
import OpeningScreen from '../../route/openingScreen/OpeningScreen.jsx';
import ForgotPasswordCodeScreen from '../../route/FPpinPage/ForgotPasswordCodeScreen.jsx';
import ResetPasswordScreen from '../../route/resetPasswordPage/ResetPasswordScreen.jsx';
import PasswordChangedScreen from '../../route/PasswordChangedScreen/PasswordChangedScreen.jsx';
import TagSelectionScreen from '../../route/TagSelectionScreen/TagSelectionScreen.jsx';
import KeywordSelectionScreen from '../../route/KeywordSelectionScreen/KeywordSelectionScreen.jsx';
import SettingsScreen from '../../route/SettingsScreen/SettingsScreen.jsx';
import EditProfileScreen from '../../route/EditProfileScreen/EditProfileScreen.jsx';
import PrivacyScreen from '../../route/PrivacyScreen/PrivacyScreen.jsx';
import DataScreen from '../../route/DataScreen/DataScreen.jsx';
import CategoriesScreen from '../../route/CategoriesScreen/CategoriesScreen.jsx';
import AboutScreen from '../../route/AboutScreen/AboutScreen.jsx';
import AdminScreen from '../../route/AdminScreen/AdminScreen.jsx';
import SearchScreen from '../../route/SearchScreen/SearchScreen.jsx';
import ArticleDetailScreen from '../../route/ArticleDetailScreen/ArticleDetailScreen.jsx';
import TrendingScreen from '../../route/TrendingScreen/TrendingScreen.jsx';
import BookmarksScreen from '../../route/BookmarksScreen/BookmarksScreen.jsx';
import RecentScreen from '../../route/RecentScreen/RecentScreen.jsx';
import TermsScreen from '../../route/TermsScreen/TermsScreen.jsx';
import VerifyEmailScreen from '../../route/VerifyEmailScreen/VerifyEmailScreen.jsx';

// OPTIONAL SCREENS - With fallback
const FallbackScreen = ({ title }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>{title}</Text>
        <Text style={{ color: '#666' }}>Create this screen file</Text>
    </View>
);

// Try to import optional screens - STATIC imports only
let NewsFeedScreen, NotificationsScreen, ProfileScreen;

try {
    NewsFeedScreen = require('../../route/NewsFeedScreen/NewsFeedScreen.jsx').default;
} catch (e) {
    NewsFeedScreen = (props) => <FallbackScreen title="News Feed" {...props} />;
}

try {
    NotificationsScreen = require('../../route/NotificationsScreen/NotificationsScreen.jsx').default;
} catch (e) {
    NotificationsScreen = (props) => <FallbackScreen title="Notifications" {...props} />;
}

try {
    ProfileScreen = require('../../route/ProfileScreen/ProfileScreen.jsx').default;
} catch (e) {
    ProfileScreen = (props) => <FallbackScreen title="Profile" {...props} />;
}

export {
    LoginScreen,
    SignUpScreen,
    ForgotPasswordScreen,
    OpeningScreen,
    ForgotPasswordCodeScreen,
    ResetPasswordScreen,
    PasswordChangedScreen,
    TagSelectionScreen,
    KeywordSelectionScreen,
    SettingsScreen,
    EditProfileScreen,
    PrivacyScreen,
    DataScreen,
    CategoriesScreen,
    AboutScreen,
    AdminScreen,
    SearchScreen,
    ArticleDetailScreen,
    NewsFeedScreen,
    NotificationsScreen,
    ProfileScreen,
    TrendingScreen,
    BookmarksScreen,
    RecentScreen,
    TermsScreen,
    VerifyEmailScreen,
};