import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationUnreadProvider } from './context/NotificationUnreadContext';
import { UserKeywordsProvider } from './context/UserKeywordsContext';
import { FeedCacheProvider } from './context/FeedCacheContext';
import { ChatBotProvider } from './context/ChatBotContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './navigation/AppRouter';
import { UIFeedbackProvider } from './components/ui/UIFeedback';
import { GlobalSkeletonStyles } from './components/skeletons/SkeletonLayouts';
import './App.css';

const App = () => {
  return (
    <ThemeProvider initialMode="light">
      <LanguageProvider>
      <GlobalSkeletonStyles />
      <UIFeedbackProvider>
        <AuthProvider>
          <NotificationUnreadProvider>
          <UserKeywordsProvider>
          <FeedCacheProvider>
          <ChatBotProvider>
          <div style={{ 
            minHeight: '100vh', 
            width: '100%',
            margin: 0,
            padding: 0,
          }} className="app-container">
            <AppRouter />
          </div>
          </ChatBotProvider>
          </FeedCacheProvider>
          </UserKeywordsProvider>
          </NotificationUnreadProvider>
        </AuthProvider>
      </UIFeedbackProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
