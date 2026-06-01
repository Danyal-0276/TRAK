import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import AppSidebar from '../components/AppSidebar';
import Navigation from '../components/Navigation';

const AUTH_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/forgot-password-code',
  '/reset-password',
  '/password-changed',
  '/tag-selection',
  '/keyword-selection',
  '/terms',
  '/privacy',
]);

export default function AppChrome() {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.has(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isArticlePage = location.pathname.startsWith('/article/');

  if (isAuthPage || isAdminPage) {
    return null;
  }

  if (isArticlePage) {
    return (
      <>
        <AppSidebar />
      </>
    );
  }

  return (
    <>
      <Header />
      <AppSidebar />
      <Navigation />
    </>
  );
}
