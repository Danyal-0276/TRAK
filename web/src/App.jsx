import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationUnreadProvider } from './context/NotificationUnreadContext';
import { UserKeywordsProvider } from './context/UserKeywordsContext';
import { FeedCacheProvider } from './context/FeedCacheContext';
import AppRouter from './navigation/AppRouter';
import ChatBotWidget from './components/ChatBotWidget';
import { UIFeedbackProvider } from './components/ui/UIFeedback';
import { GlobalSkeletonStyles } from './components/skeletons/SkeletonLayouts';
import './App.css';

const App = () => {
  return (
    <ThemeProvider initialMode="light">
      <GlobalSkeletonStyles />
      <UIFeedbackProvider>
        <AuthProvider>
          <NotificationUnreadProvider>
          <UserKeywordsProvider>
          <FeedCacheProvider>
          <div style={{ 
            minHeight: '100vh', 
            width: '100%',
            margin: 0,
            padding: 0,
          }} className="app-container">
            <AppRouter />
            <ChatBotWidget />
          </div>
          </FeedCacheProvider>
          </UserKeywordsProvider>
          </NotificationUnreadProvider>
        </AuthProvider>
      </UIFeedbackProvider>
    </ThemeProvider>
  );
};

export default App;
