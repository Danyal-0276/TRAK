/** Public TRAK web app origin (share links, PDF footer). */
export const PUBLIC_WEB_ORIGIN =
  (import.meta.env.VITE_PUBLIC_WEB_URL || '').replace(/\/$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://trak-flax.vercel.app');
