import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppChrome from './AppChrome';
import RouterContent from './RouterContent';
import ChatBotWidget from '../components/ChatBotWidget';
import GoogleAuthRedirectHandler from './GoogleAuthRedirectHandler';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <GoogleAuthRedirectHandler />
      <AppChrome />
      <RouterContent />
      <ChatBotWidget />
    </BrowserRouter>
  );
};

export default AppRouter;

