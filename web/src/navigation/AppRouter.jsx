import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppChrome from './AppChrome';
import RouterContent from './RouterContent';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AppChrome />
      <RouterContent />
    </BrowserRouter>
  );
};

export default AppRouter;

