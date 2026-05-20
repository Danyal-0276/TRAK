import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

function readConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

/** True when Firebase web env vars are set (Google sign-in can be used). */
export function isFirebaseConfigured() {
  const { apiKey, projectId, appId } = readConfig();
  return Boolean(
    apiKey &&
      String(apiKey).trim() &&
      apiKey !== 'undefined' &&
      projectId &&
      appId
  );
}

let appInstance = null;
let authInstance = null;
let googleProviderInstance = null;

function ensureFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Google sign-in is not configured. Add Firebase keys to TRAK/web/.env (see .env.example), then restart the dev server.'
    );
  }
  if (!appInstance) {
    appInstance = initializeApp(readConfig());
    authInstance = getAuth(appInstance);
    googleProviderInstance = new GoogleAuthProvider();
  }
  return { auth: authInstance, googleProvider: googleProviderInstance };
}

export function getFirebaseAuth() {
  return ensureFirebase().auth;
}

export function getGoogleProvider() {
  return ensureFirebase().googleProvider;
}
