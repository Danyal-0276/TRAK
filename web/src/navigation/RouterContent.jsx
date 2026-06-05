import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import OpeningScreen from '../route/openingScreen/OpeningScreen';
import LoginScreen from '../route/LoginPage/LoginScreen';
import SignUpScreen from '../route/signUpPage/SignUpScreen';
import ForgotPasswordScreen from '../route/forgotPasswordPage/ForgotPasswordScreen';
import ForgotPasswordCodeScreen from '../route/FPpinPage/ForgotPasswordCodeScreen';
import ResetPasswordScreen from '../route/resetPasswordPage/ResetPasswordScreen';
import PasswordChangedScreen from '../route/PasswordChangedScreen/PasswordChangedScreen';
import TagSelectionScreen from '../route/TagSelectionScreen/TagSelectionScreen';
import KeywordSelectionScreen from '../route/KeywordSelectionScreen/KeywordSelectionScreen';
import VerifyEmailScreen from '../route/VerifyEmailScreen/VerifyEmailScreen';
import NewsFeedScreen from '../route/NewsFeedScreen/NewsFeedScreen';
import SearchScreen from '../route/SearchScreen/SearchScreen';
import NotificationsScreen from '../route/NotificationsScreen/NotificationsScreen';
import ProfileScreen from '../route/ProfileScreen/ProfileScreen';
import AdminShell from '../route/AdminScreen/components/AdminShell';
import SettingsScreen from '../route/SettingsScreen/SettingsScreen';
import EditProfileScreen from '../route/EditProfileScreen/EditProfileScreen';
import PrivacyScreen from '../route/PrivacyScreen/PrivacyScreen';
import TermsScreen from '../route/TermsScreen/TermsScreen';
import DataScreen from '../route/DataScreen/DataScreen';
import CategoriesScreen from '../route/CategoriesScreen/CategoriesScreen';
import AboutScreen from '../route/AboutScreen/AboutScreen';
import HelpScreen from '../route/HelpScreen/HelpScreen';
import ArticleDetailScreen from '../route/ArticleDetailScreen/ArticleDetailScreen';
import BookmarksScreen from '../route/BookmarksScreen/BookmarksScreen';
import ReactionArticlesScreen from '../route/ReactionArticlesScreen/ReactionArticlesScreen';
import RecentScreen from '../route/RecentScreen/RecentScreen';
import PicsScreen from '../route/PicsScreen/PicsScreen';
import ProtectedRoute from '../components/ProtectedRoute';
import UserOnlyRoute from '../components/UserOnlyRoute';
import { useTheme } from '../theme/ThemeContext';

const RouterContent = () => {
  const location = useLocation();
  const { isDesktop, isMobile } = useResponsive();
  const { theme } = useTheme();
  const { colors } = theme;
  const isAuthPage = ['/', '/login', '/signup', '/verify-email', '/forgot-password', '/forgot-password-code', '/reset-password', '/password-changed', '/tag-selection', '/keyword-selection', '/terms', '/privacy'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMainAppPage = !isAuthPage && !isAdminPage;

  return (
    <div 
      data-auth={isAuthPage ? "true" : "false"}
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: colors.background,
        paddingTop: isMainAppPage && isMobile ? '4px' : '0',
        marginTop: '0',
        paddingRight: isMainAppPage && isDesktop ? '280px' : '0',
        paddingLeft: '0',
        transition: 'padding 0.3s ease, background-color var(--trak-transition-duration, 0s) var(--trak-transition-ease, ease)',
      }}
    >
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<OpeningScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/verify-email" element={<VerifyEmailScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/forgot-password-code" element={<ForgotPasswordCodeScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/password-changed" element={<PasswordChangedScreen />} />
        <Route path="/tag-selection" element={<TagSelectionScreen />} />
        <Route path="/keyword-selection" element={<KeywordSelectionScreen />} />
        <Route path="/terms" element={<TermsScreen />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        
        {/* Main App Routes */}
        <Route path="/newsfeed" element={<UserOnlyRoute><NewsFeedScreen /></UserOnlyRoute>} />
        <Route path="/search" element={<UserOnlyRoute><SearchScreen /></UserOnlyRoute>} />
        <Route path="/notifications" element={<UserOnlyRoute><NotificationsScreen /></UserOnlyRoute>} />
        <Route path="/profile" element={<UserOnlyRoute><ProfileScreen /></UserOnlyRoute>} />
        <Route path="/settings" element={<UserOnlyRoute><SettingsScreen /></UserOnlyRoute>} />
        <Route path="/edit-profile" element={<UserOnlyRoute><EditProfileScreen /></UserOnlyRoute>} />
        <Route path="/data" element={<UserOnlyRoute><DataScreen /></UserOnlyRoute>} />
        <Route path="/categories" element={<UserOnlyRoute><CategoriesScreen /></UserOnlyRoute>} />
        <Route path="/about" element={<UserOnlyRoute><AboutScreen /></UserOnlyRoute>} />
        <Route path="/help" element={<UserOnlyRoute><HelpScreen /></UserOnlyRoute>} />
        <Route path="/trending" element={<Navigate to="/newsfeed?tab=Trending" replace />} />
        <Route path="/bookmarks" element={<UserOnlyRoute><BookmarksScreen /></UserOnlyRoute>} />
        <Route path="/liked" element={<UserOnlyRoute><ReactionArticlesScreen reaction="like" /></UserOnlyRoute>} />
        <Route path="/disliked" element={<UserOnlyRoute><ReactionArticlesScreen reaction="dislike" /></UserOnlyRoute>} />
        <Route path="/recent" element={<UserOnlyRoute><RecentScreen /></UserOnlyRoute>} />
        <Route path="/pics" element={<UserOnlyRoute><PicsScreen /></UserOnlyRoute>} />
        <Route path="/article/:id" element={<UserOnlyRoute><ArticleDetailScreen /></UserOnlyRoute>} />
        
        {/* Admin-only panel (same as mobile — no newsfeed chrome) */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" />
          <Route path="users" />
          <Route path="users/:userId" />
          <Route path="admins" />
          <Route path="profile" />
          <Route path="articles" />
          <Route path="notifications" />
          <Route path="feedback" />
          <Route path="settings" />
          <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default RouterContent;

