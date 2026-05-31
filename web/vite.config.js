import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    // Dev proxy when VITE_API_URL=http://localhost:3000 — forwards /api to backend.
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Vite HMR needs unsafe-eval; Firebase Google sign-in needs Google/Firebase hosts.
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://www.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://accounts.google.com",
        "img-src 'self' data: blob: https://*.googleusercontent.com https://www.gstatic.com",
        "font-src 'self' data:",
        "connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 https://trak-backend-upip.onrender.com https://*.googleapis.com https://*.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com wss://localhost:3000 ws://localhost:3000",
        "frame-src 'self' https://accounts.google.com https://*.google.com https://*.firebaseapp.com https://*.web.app",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; '),
    },
  },
});


