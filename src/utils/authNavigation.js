/**
 * Post-auth navigation for React Native (returning users → feed, not tag picker).
 * @param {{ user?: object, is_new_user?: boolean, onboarding_complete?: boolean }} session
 * @param {{ fromSignup?: boolean }} [options]
 */
export function getPostAuthRouteName(session, { fromSignup = false } = {}) {
  const user = session?.user;
  if (user?.role === 'admin') return 'AdminScreen';

  if (!fromSignup) {
    return 'NewsFeed';
  }

  if (session?.is_new_user === false || session?.onboarding_complete) {
    return 'NewsFeed';
  }

  return 'TagSelection';
}

export function getPostAuthRouteParams(routeName, { fromSignup = false } = {}) {
  if (routeName === 'TagSelection' && fromSignup) {
    return { fromSignup: true };
  }
  return undefined;
}
