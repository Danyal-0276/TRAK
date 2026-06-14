import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLoginRedirectPath } from '../utils/authNavigation';
import { useUIFeedback } from '../components/ui/UIFeedback';

const RETURN_KEY = 'trak_google_auth_return';

/** Persist return path before signInWithRedirect (full page navigation). */
export function stashGoogleAuthReturn(returnTo) {
  if (returnTo && typeof returnTo === 'string') {
    sessionStorage.setItem(RETURN_KEY, returnTo);
  } else {
    sessionStorage.removeItem(RETURN_KEY);
  }
}

export function takeGoogleAuthReturn() {
  const value = sessionStorage.getItem(RETURN_KEY) || '';
  sessionStorage.removeItem(RETURN_KEY);
  return value;
}

/** Completes Google sign-in after signInWithRedirect round-trip. */
export default function GoogleAuthRedirectHandler() {
  const navigate = useNavigate();
  const { finishGoogleRedirectLogin, isFirebaseConfigured } = useAuth();
  const { error: showError } = useUIFeedback();
  const started = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured || started.current) return;
    started.current = true;

    (async () => {
      try {
        const session = await finishGoogleRedirectLogin();
        if (!session) return;
        const returnTo = takeGoogleAuthReturn();
        navigate(getLoginRedirectPath(session, returnTo), { replace: true });
      } catch (err) {
        showError(err?.message || 'Google sign-in failed');
      }
    })();
  }, [finishGoogleRedirectLogin, isFirebaseConfigured, navigate, showError]);

  return null;
}
