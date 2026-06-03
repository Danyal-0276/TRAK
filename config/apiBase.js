/**
 * Deployed Django API origin.
 *
 * Do not hardcode URLs here — set environment variables instead:
 * - Web (Vite): `web/.env` → VITE_API_URL
 * - Mobile: `src/config/api.local.js` (from api.local.example.js)
 * - Netlify: `web/netlify.toml` → VITE_API_URL
 * - Render: dashboard env (backend) + front-end build env
 */
export const RENDER_API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
