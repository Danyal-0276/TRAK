import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLoginRedirectPath } from '../utils/authNavigation';
import { useUIFeedback } from '../components/ui/UIFeedback';
import { isGoogleRedirectPending, takeGoogleAuthReturn } from '../utils/googleRedirectSession';

/** Completes Google sign-in after signInWithRedirect round-trip. */
export default function GoogleAuthRedirectHandler() {
  const navigate = useNavigate();
  const { finishGoogleRedirectLogin, isFirebaseConfigured } = useAuth();
  const { error: showError } = useUIFeedback();
  const handled = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !isGoogleRedirectPending()) return;
    if (handled.current) return;
    handled.current = true;

    (async () => {
      try {
        const session = await finishGoogleRedirectLogin();
        if (!session) {
          handled.current = false;
          return;
        }
        const returnTo = takeGoogleAuthReturn();
        navigate(getLoginRedirectPath(session, returnTo), { replace: true });
      } catch (err) {
        handled.current = false;
        showError(err?.message || 'Google sign-in failed');
      }
    })();
  }, [finishGoogleRedirectLogin, isFirebaseConfigured, navigate, showError]);

  return null;
}
