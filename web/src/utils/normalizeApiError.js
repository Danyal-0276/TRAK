/**
 * Normalizes Django REST Framework error responses into user-friendly messages.
 * Handles: detail, non_field_errors, field arrays, nested errors objects.
 *
 * @param {object|null} payload - parsed JSON body (may be null)
 * @param {number} status - HTTP status code
 * @returns {{ message: string, fields: Record<string, string> }}
 */
function extractErrorText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = extractErrorText(item);
      if (text) return text;
    }
    return '';
  }
  if (typeof value === 'object') {
    if (typeof value.message === 'string') return value.message;
    if (typeof value.detail === 'string') return value.detail;
    if (Array.isArray(value.messages)) return extractErrorText(value.messages);
  }
  return '';
}

export function normalizeApiError(payload, status) {
  const fields = {};

  if (!payload || typeof payload !== 'object') {
    return { message: httpStatusMessage(status), fields };
  }

  // DRF detail string or nested object (e.g. JWT / validation)
  if (payload.detail != null) {
    const detailText = extractErrorText(payload.detail);
    if (detailText) {
      return { message: friendlyMessage(detailText, status), fields };
    }
  }

  // SimpleJWT-style messages array
  if (Array.isArray(payload.messages) && payload.messages.length) {
    const text = extractErrorText(payload.messages);
    if (text) {
      return { message: friendlyMessage(text, status), fields };
    }
  }

  // non_field_errors array
  if (Array.isArray(payload.non_field_errors) && payload.non_field_errors.length) {
    const text = extractErrorText(payload.non_field_errors);
    if (text) {
      return { message: friendlyMessage(text, status), fields };
    }
  }

  // errors wrapper (some DRF serializers wrap under `errors`)
  const target = typeof payload.errors === 'object' && payload.errors !== null
    ? payload.errors
    : payload;

  for (const [key, value] of Object.entries(target)) {
    if (key === 'non_field_errors' || key === 'detail' || key === 'messages') continue;
    const raw = extractErrorText(value);
    if (raw) fields[key] = friendlyMessage(raw, null);
  }

  const firstFieldMsg = Object.values(fields)[0];
  if (firstFieldMsg) {
    return { message: firstFieldMsg, fields };
  }

  return { message: httpStatusMessage(status), fields };
}

/**
 * Same as normalizeApiError but returns just the message string.
 * Suitable as a drop-in for parseError catch blocks.
 */
export function normalizeApiErrorMessage(payload, status) {
  return normalizeApiError(payload, status).message;
}

function httpStatusMessage(status) {
  if (status === 400) return 'The information you entered is invalid. Please check and try again.';
  if (status === 401) return 'Incorrect email or password. Please try again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status === 502) {
    return 'The API server is not reachable. Restart the backend on the VPS and ensure port 8000 is open, then click Refresh.';
  }
  if (status >= 500) return 'Something went wrong on our end. Please try again shortly.';
  return 'Something went wrong. Please try again.';
}

function friendlyMessage(raw, status) {
  if (!raw) return httpStatusMessage(status);
  // Remove technical brackets/quotes that DRF sometimes includes
  const clean = raw.replace(/^\["|"\]$/g, '').replace(/^'|'$/g, '').trim();
  if (!clean) return httpStatusMessage(status);
  // Capitalise first letter
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
