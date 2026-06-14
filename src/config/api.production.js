/**
 * Committed production API — used for release builds (App Store / Play Store).
 * Dev overrides live in gitignored api.local.js (__DEV__ only).
 */
export const PRODUCTION_API_BASE = 'http://167.86.110.151:8000';

/** WebSocket notifications (requires daphne/ASGI on the VPS). */
export const ENABLE_NOTIFICATIONS_WS = true;
