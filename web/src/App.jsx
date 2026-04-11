import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './navigation/AppRouter';
import ChatBotWidget from './components/ChatBotWidget';
import { UIFeedbackProvider } from './components/ui/UIFeedback';
import './App.css';

const App = () => {
  return (
    <ThemeProvider initialMode="light">
      <UIFeedbackProvider>
        <AuthProvider>
          <div style={{ 
            minHeight: '100vh', 
            width: '100%',
            margin: 0,
            padding: 0,
          }} className="app-container">
            <AppRouter />
            <ChatBotWidget />
          </div>
        </AuthProvider>
      </UIFeedbackProvider>
    </ThemeProvider>
  );
};

export default App;
