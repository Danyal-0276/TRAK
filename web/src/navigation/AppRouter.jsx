import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppChrome from './AppChrome';
import RouterContent from './RouterContent';
import ChatBotWidget from '../components/ChatBotWidget';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AppChrome />
      <RouterContent />
      <ChatBotWidget />
    </BrowserRouter>
  );
};

export default AppRouter;

