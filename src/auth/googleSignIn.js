import { NativeModules } from 'react-native';

/** Web client ID (client_type 3) from android/app/google-services.json */
const WEB_CLIENT_ID =
  '966052710818-9qmi9krb8675cr5ioor5c5qbuokuv393.apps.googleusercontent.com';

let googleConfigured = false;

export function formatGoogleAuthError(error) {
  const message = error?.message || String(error || 'Google sign-in failed');
  if (/RNGoogleSignin|TurboModuleRegistry/i.test(message)) {
    return (
      'Google Sign-In is not in this app build. Uninstall TRAK, then run: npx react-native run-android'
    );
  }
  if (/auth.*could not be found|RNFBAuthModule/i.test(message)) {
    return 'Firebase Auth is not linked. Rebuild the app: npx react-native run-android';
  }
  if (/DEVELOPER_ERROR|10:/i.test(message)) {
    return 'Google Sign-In config error. Check SHA-1 and package com.traknews.app in Firebase.';
  }
  return message;
}

function ensureFirebaseNative() {
  if (!NativeModules.RNFBAppModule) {
    throw new Error(
      'Firebase native module is missing. Run: npx react-native run-android',
    );
  }
}

function ensureGoogleSignInNative() {
  if (!NativeModules.RNGoogleSignin) {
    throw new Error(
      'Google Sign-In native module is missing. Uninstall the app, then run: npx react-native run-android',
    );
  }
}

function loadGoogleSignIn() {
  ensureGoogleSignInNative();
  // Lazy load so the app can start even before a native rebuild.
  return require('@react-native-google-signin/google-signin');
}

function loadFirebaseAuth() {
  ensureFirebaseNative();
  return require('@react-native-firebase/auth').default;
}

function configureGoogleSignIn(GoogleSignin) {
  if (googleConfigured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
  });
  googleConfigured = true;
}

/**
 * Google account picker → Firebase credential → Firebase ID token for TRAK API.
 */
export async function getFirebaseIdTokenFromGoogle() {
  const { GoogleSignin, isCancelledResponse, isSuccessResponse } = loadGoogleSignIn();
  const auth = loadFirebaseAuth();
  configureGoogleSignIn(GoogleSignin);

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Clear cached account so the user always gets the account chooser.
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore — no saved session
  }

  const signInResult = await GoogleSignin.signIn();

  if (isCancelledResponse(signInResult)) {
    throw new Error('Google sign-in was cancelled');
  }
  if (!isSuccessResponse(signInResult) || !signInResult.data?.idToken) {
    throw new Error('Google sign-in did not return an ID token');
  }

  const googleIdToken = signInResult.data.idToken;
  const credential = auth.GoogleAuthProvider.credential(googleIdToken);
  const userCredential = await auth().signInWithCredential(credential);
  return userCredential.user.getIdToken();
}
