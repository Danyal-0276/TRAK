const PREVIEW_KEY = 'trak_admin_app_preview';

export function enableAdminAppPreview() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(PREVIEW_KEY, '1');
  }
}

export function disableAdminAppPreview() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(PREVIEW_KEY);
  }
}

export function isAdminAppPreview() {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(PREVIEW_KEY) === '1';
}
