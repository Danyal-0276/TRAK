import { initializeApp } from 'firebase/app';
import { getAuth, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';

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
/** Shared promise from getRedirectResult — must be captured once at page load. */
let startupRedirectResultPromise = null;

function ensureFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Google sign-in is not configured. Add VITE_FIREBASE_* keys in Vercel env, then redeploy.'
    );
  }
  if (!appInstance) {
    appInstance = initializeApp(readConfig());
    authInstance = getAuth(appInstance);
  }
  return authInstance;
}

export function getFirebaseAuth() {
  return ensureFirebase();
}

/** Fresh provider each time so account picker params apply reliably. */
export function getGoogleProvider() {
  ensureFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

/**
 * Call once before React mounts so Firebase reads the OAuth callback from the URL.
 * getRedirectResult may only be consumed once per page load.
 */
export function captureRedirectResultAtStartup() {
  if (!isFirebaseConfigured() || typeof window === 'undefined') return;
  if (startupRedirectResultPromise) return;
  try {
    startupRedirectResultPromise = getRedirectResult(ensureFirebase());
  } catch {
    startupRedirectResultPromise = Promise.resolve(null);
  }
}

export function getStartupRedirectResultPromise() {
  return startupRedirectResultPromise;
}
