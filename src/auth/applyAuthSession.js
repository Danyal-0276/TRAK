import { setTokens } from '../api/client';
import { saveAuthSession } from '../utils/Service/api';

/** Persist TRAK JWTs after email, OTP, or Firebase Google login. */
export async function applyAuthSession(session) {
  await setTokens(session.access, session.refresh);
  await saveAuthSession(session);
  return session;
}
