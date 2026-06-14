import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { getUserFacingError } from './utils/getUserFacingError';
import { captureRedirectResultAtStartup } from './firebase';

// Must run before React so Firebase can read the OAuth callback from the URL.
captureRedirectResultAtStartup();

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>Something went wrong</h1>
          <p style={{ color: '#64748b', marginBottom: '8px' }}>
            {getUserFacingError(this.state.error, { fallback: 'Something went wrong loading the app. Please reload and try again.' })}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '16px',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

