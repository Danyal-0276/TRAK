import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthSessionEnded } from '../utils/authSessionEvents';

/** Redirects to login as soon as the session is invalidated (deleted account, expired tokens). */
export default function SessionGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthSessionEnded((reason) => {
      navigate(reason === 'manual' ? '/' : '/login', { replace: true });
    });
  }, [navigate]);

  return null;
}
