import { getRedirectResult } from 'firebase/auth';
import { getStartupRedirectResultPromise } from '../firebase';

const PENDING_KEY = 'trak_google_redirect_pending';
const RETURN_KEY = 'trak_google_auth_return';

/** Set before signInWithRedirect — cleared after TRAK session is applied. */
export function markGoogleRedirectPending() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(PENDING_KEY, '1');
  }
}

export function clearGoogleRedirectPending() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(PENDING_KEY);
  }
}

export function isGoogleRedirectPending() {
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PENDING_KEY) === '1';
}

export function stashGoogleAuthReturn(returnTo) {
  if (typeof sessionStorage === 'undefined') return;
  if (returnTo && typeof returnTo === 'string') {
    sessionStorage.setItem(RETURN_KEY, returnTo);
  } else {
    sessionStorage.removeItem(RETURN_KEY);
  }
}

export function takeGoogleAuthReturn() {
  if (typeof sessionStorage === 'undefined') return '';
  const value = sessionStorage.getItem(RETURN_KEY) || '';
  sessionStorage.removeItem(RETURN_KEY);
  return value;
}

let redirectResultPromise = null;
let exchangeInFlight = null;

/** Prevent duplicate TRAK token exchange when handler + LoginScreen both run. */
export async function runGoogleRedirectExchange(exchange) {
  if (exchangeInFlight) return exchangeInFlight;
  exchangeInFlight = exchange().finally(() => {
    exchangeInFlight = null;
  });
  return exchangeInFlight;
}

/** getRedirectResult may only be consumed once per page load — share one promise. */
function getSharedRedirectResult(auth) {
  if (!redirectResultPromise) {
    redirectResultPromise = getStartupRedirectResultPromise() ?? getRedirectResult(auth);
  }
  return redirectResultPromise;
}

function waitForAuthUser(auth, timeoutMs = 10000) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(auth.currentUser || null);
    }, timeoutMs);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Resolve Firebase user after signInWithRedirect round-trip.
 * Waits for auth state when getRedirectResult is empty but redirect was pending.
 */
export async function resolveFirebaseUserAfterRedirect(auth) {
  const pending = isGoogleRedirectPending();
  let result = null;
  try {
    result = await getSharedRedirectResult(auth);
  } catch {
    result = null;
  }

  if (result?.user) {
    return result.user;
  }

  if (pending) {
    return waitForAuthUser(auth);
  }

  return null;
}
