import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Header from '../components/Header';
import AppSidebar from '../components/AppSidebar';
import RouterContent from './RouterContent';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Header />
      <AppSidebar />
      <RouterContent />
      <Navigation />
    </BrowserRouter>
  );
};

export default AppRouter;

