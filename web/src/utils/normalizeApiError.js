/**
 * Normalizes Django REST Framework error responses into user-friendly messages.
 * Handles: detail, non_field_errors, field arrays, nested errors objects.
 *
 * @param {object|null} payload - parsed JSON body (may be null)
 * @param {number} status - HTTP status code
 * @returns {{ message: string, fields: Record<string, string> }}
 */
export function normalizeApiError(payload, status) {
  const fields = {};

  if (!payload || typeof payload !== 'object') {
    return { message: httpStatusMessage(status), fields };
  }

  // DRF detail string
  if (typeof payload.detail === 'string') {
    return { message: friendlyMessage(payload.detail, status), fields };
  }

  // non_field_errors array
  if (Array.isArray(payload.non_field_errors) && payload.non_field_errors.length) {
    return { message: friendlyMessage(String(payload.non_field_errors[0]), status), fields };
  }

  // errors wrapper (some DRF serializers wrap under `errors`)
  const target = typeof payload.errors === 'object' && payload.errors !== null
    ? payload.errors
    : payload;

  for (const [key, value] of Object.entries(target)) {
    if (key === 'non_field_errors') continue;
    const raw = Array.isArray(value) ? String(value[0]) : String(value);
    fields[key] = friendlyMessage(raw, null);
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
