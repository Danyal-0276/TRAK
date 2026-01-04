import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './navigation/AppRouter';
import './App.css';

const App = () => {
  return (
    <ThemeProvider initialMode="light">
      <AuthProvider>
        <div style={{ 
          minHeight: '100vh', 
          width: '100%',
          margin: 0,
          padding: 0,
        }} className="app-container">
          <AppRouter />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
