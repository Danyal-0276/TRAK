/**
 * Post-auth routes: returning users skip tag/keyword onboarding.
 * @param {{ user?: object, is_new_user?: boolean, onboarding_complete?: boolean, verification_required?: boolean }} session
 * @param {{ fromSignup?: boolean }} [options]
 */
export function getPostAuthPath(session, { fromSignup = false } = {}) {
  const user = session?.user;
  if (user?.role === 'admin') return '/admin/dashboard';

  if (!fromSignup) {
    return '/newsfeed';
  }

  if (session?.is_new_user === false || session?.onboarding_complete) {
    return '/newsfeed';
  }

  return '/tag-selection';
}

export function getPostAuthState(path, { fromSignup = false } = {}) {
  if (path === '/tag-selection') {
    return { fromSignup: true };
  }
  return undefined;
}
