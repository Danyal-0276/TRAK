import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import AppSidebar from '../components/AppSidebar';
import Navigation from '../components/Navigation';
import { isAuthPath } from './authPaths';

export default function AppChrome() {
  const location = useLocation();
  const isAuthPage = isAuthPath(location.pathname);
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
