/**
 * Deployed API origins (single source of truth for clients).
 *
 * Web production: Vercel same-origin + vercel.json proxies /api → VPS.
 * Mobile production: direct VPS (src/config/api.production.js).
 * Backend: Django on VPS (167.86.110.151:8000).
 */

/** VPS Django API (daphne/gunicorn). */
export const VPS_API_BASE = 'http://167.86.110.151:8000';

/** Production web app — API calls go to /api on this host (Vercel rewrite → VPS). */
export const PRODUCTION_WEB_API_BASE = 'https://trak-flax.vercel.app';

/** @deprecated Use PRODUCTION_WEB_API_BASE — kept for existing imports. */
export const RENDER_API_BASE = PRODUCTION_WEB_API_BASE;
