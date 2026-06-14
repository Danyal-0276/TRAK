/**
 * Map Firebase Auth errors to plain language for login UI.
 * @param {unknown} err
 */
export function getFirebaseAuthErrorMessage(err) {
  const code = err?.code || '';
  const msg = typeof err?.message === 'string' ? err.message : '';

  switch (code) {
    case 'auth/unauthorized-domain':
      return (
        'This site is not authorized for Google sign-in. Add trak-flax.vercel.app in Firebase → Authentication → ' +
        'Settings → Authorized domains. Also add https://trak-flax.vercel.app under Google Cloud Console → ' +
        'Credentials → OAuth Web client → Authorized JavaScript origins.'
      );
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked. Allow popups for this site and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was interrupted. Please try again.';
    case 'auth/network-request-failed':
      return 'Could not reach Google sign-in. Check your internet connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled in Firebase. Enable Google under Authentication → Sign-in method.';
    case 'auth/requests-from-referer-are-blocked':
      return (
        'Google OAuth blocked this site. In Google Cloud Console → Credentials → OAuth Web client, add ' +
        'https://trak-flax.vercel.app to Authorized JavaScript origins.'
      );
    default:
      break;
  }

  if (msg.includes('Firebase is not configured on the server')) {
    return 'Server Firebase is not set up. On the VPS, add firebase-service-account.json or FIREBASE_CREDENTIALS_JSON.';
  }
  if (msg.includes('Invalid Firebase token')) {
    return 'Google sign-in succeeded but the server rejected the token. Check VPS Firebase credentials match project trak-46a8f.';
  }

  return msg || 'Google sign-in failed. Please try again.';
}
