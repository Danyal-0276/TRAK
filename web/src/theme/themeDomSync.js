import { applyPaletteCssVars } from './themeCssVars';

/** Apply theme to <html> synchronously (must run in the same frame as React color updates). */
export function syncThemeToDocument(mode, palette) {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.style.colorScheme = mode;
  applyPaletteCssVars(root, palette);
  try {
    localStorage.setItem('theme', mode);
  } catch {
    /* private mode */
  }
}
