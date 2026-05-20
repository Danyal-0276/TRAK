import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../theme/ThemeContext';
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
import AdminDashboardScreen from '../route/AdminScreen/AdminDashboardScreen';
import AdminUsersScreen from '../route/AdminScreen/AdminUsersScreen';
import AdminAdminsScreen from '../route/AdminScreen/AdminAdminsScreen';
import AdminProfileScreen from '../route/AdminScreen/AdminProfileScreen';
import AdminArticlesScreen from '../route/AdminScreen/AdminArticlesScreen';
import AdminNotificationsScreen from '../route/AdminScreen/AdminNotificationsScreen';
import AdminSettingsScreen from '../route/AdminScreen/AdminSettingsScreen';
import SettingsScreen from '../route/SettingsScreen/SettingsScreen';
import EditProfileScreen from '../route/EditProfileScreen/EditProfileScreen';
import PrivacyScreen from '../route/PrivacyScreen/PrivacyScreen';
import TermsScreen from '../route/TermsScreen/TermsScreen';
import DataScreen from '../route/DataScreen/DataScreen';
import CategoriesScreen from '../route/CategoriesScreen/CategoriesScreen';
import AboutScreen from '../route/AboutScreen/AboutScreen';
import HelpScreen from '../route/HelpScreen/HelpScreen';
import ArticleDetailScreen from '../route/ArticleDetailScreen/ArticleDetailScreen';
import TrendingScreen from '../route/TrendingScreen/TrendingScreen';
import BookmarksScreen from '../route/BookmarksScreen/BookmarksScreen';
import RecentScreen from '../route/RecentScreen/RecentScreen';
import ProtectedRoute from '../components/ProtectedRoute';
import UserOnlyRoute from '../components/UserOnlyRoute';

const RouterContent = () => {
  const location = useLocation();
  const { isDesktop } = useResponsive();
  const { theme } = useTheme();
  const isAuthPage = ['/', '/login', '/signup', '/verify-email', '/forgot-password', '/forgot-password-code', '/reset-password', '/password-changed', '/tag-selection', '/keyword-selection', '/terms', '/privacy'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMainAppPage = !isAuthPage && !isAdminPage;

  const shellClass = isMainAppPage && isDesktop ? 'trak-shell-main' : '';

  return (
    <div
      data-auth={isAuthPage ? 'true' : 'false'}
      data-theme={theme.mode}
      className={shellClass || undefined}
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--trak-bg)',
        transition: 'background 0.3s ease, padding 0.3s ease',
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
        <Route path="/trending" element={<UserOnlyRoute><TrendingScreen /></UserOnlyRoute>} />
        <Route path="/bookmarks" element={<UserOnlyRoute><BookmarksScreen /></UserOnlyRoute>} />
        <Route path="/recent" element={<UserOnlyRoute><RecentScreen /></UserOnlyRoute>} />
        <Route path="/article/:id" element={<UserOnlyRoute><ArticleDetailScreen /></UserOnlyRoute>} />
        
        {/* Admin-only panel (same as mobile — no newsfeed chrome) */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardScreen />} />
          <Route path="users" element={<AdminUsersScreen />} />
          <Route path="admins" element={<AdminAdminsScreen />} />
          <Route path="profile" element={<AdminProfileScreen />} />
          <Route path="articles" element={<AdminArticlesScreen />} />
          <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="notifications" element={<AdminNotificationsScreen />} />
          <Route path="settings" element={<AdminSettingsScreen />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default RouterContent;

