/** Routes without app chrome / chatbot (auth + onboarding). */
export const AUTH_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/forgot-password-code',
  '/reset-password',
  '/password-changed',
  '/tag-selection',
  '/keyword-selection',
  '/terms',
  '/privacy',
]);

export function isAuthPath(pathname) {
  return AUTH_PATHS.has(pathname);
}
