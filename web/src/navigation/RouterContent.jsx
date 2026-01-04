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
import NewsFeedScreen from '../route/NewsFeedScreen/NewsFeedScreen';
import SearchScreen from '../route/SearchScreen/SearchScreen';
import NotificationsScreen from '../route/NotificationsScreen/NotificationsScreen';
import ProfileScreen from '../route/ProfileScreen/ProfileScreen';
import AdminScreen from '../route/AdminScreen/AdminScreen';
import AdminDashboardScreen from '../route/AdminScreen/AdminDashboardScreen';
import AdminUsersScreen from '../route/AdminScreen/AdminUsersScreen';
import AdminArticlesScreen from '../route/AdminScreen/AdminArticlesScreen';
import AdminAnalyticsScreen from '../route/AdminScreen/AdminAnalyticsScreen';
import SettingsScreen from '../route/SettingsScreen/SettingsScreen';
import EditProfileScreen from '../route/EditProfileScreen/EditProfileScreen';
import PrivacyScreen from '../route/PrivacyScreen/PrivacyScreen';
import TermsScreen from '../route/TermsScreen/TermsScreen';
import DataScreen from '../route/DataScreen/DataScreen';
import CategoriesScreen from '../route/CategoriesScreen/CategoriesScreen';
import AboutScreen from '../route/AboutScreen/AboutScreen';
import ArticleDetailScreen from '../route/ArticleDetailScreen/ArticleDetailScreen';
import TrendingScreen from '../route/TrendingScreen/TrendingScreen';
import BookmarksScreen from '../route/BookmarksScreen/BookmarksScreen';
import RecentScreen from '../route/RecentScreen/RecentScreen';
import ProtectedRoute from '../components/ProtectedRoute';

const RouterContent = () => {
  const location = useLocation();
  const { isDesktop } = useResponsive();
  const isAuthPage = ['/', '/login', '/signup', '/forgot-password', '/forgot-password-code', '/reset-password', '/password-changed', '/tag-selection', '/keyword-selection', '/terms', '/privacy'].includes(location.pathname);
  const isMainAppPage = !isAuthPage;

  return (
    <div 
      data-auth={isAuthPage ? "true" : "false"}
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: isAuthPage ? '#ffffff' : '#f9fafb',
        paddingTop: '0',
        marginTop: '0',
        paddingRight: isMainAppPage && isDesktop ? '280px' : '0',
        paddingLeft: '0',
        transition: 'padding 0.3s ease',
      }}
    >
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<OpeningScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/forgot-password-code" element={<ForgotPasswordCodeScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/password-changed" element={<PasswordChangedScreen />} />
        <Route path="/tag-selection" element={<TagSelectionScreen />} />
        <Route path="/keyword-selection" element={<KeywordSelectionScreen />} />
        <Route path="/terms" element={<TermsScreen />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        
        {/* Main App Routes */}
        <Route path="/newsfeed" element={<ProtectedRoute><NewsFeedScreen /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchScreen /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfileScreen /></ProtectedRoute>} />
        <Route path="/data" element={<ProtectedRoute><DataScreen /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesScreen /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AboutScreen /></ProtectedRoute>} />
        <Route path="/trending" element={<ProtectedRoute><TrendingScreen /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><BookmarksScreen /></ProtectedRoute>} />
        <Route path="/recent" element={<ProtectedRoute><RecentScreen /></ProtectedRoute>} />
        <Route path="/article/:id" element={<ProtectedRoute><ArticleDetailScreen /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboardScreen /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsersScreen /></ProtectedRoute>} />
        <Route path="/admin/articles" element={<ProtectedRoute requireAdmin={true}><AdminArticlesScreen /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin={true}><AdminAnalyticsScreen /></ProtectedRoute>} />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default RouterContent;

