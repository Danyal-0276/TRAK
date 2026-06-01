/** CSS custom properties synced from theme palette (for smooth transitions). */

const TRANSITION_COLOR_KEYS = [
  'background',
  'backgroundSecondary',
  'backgroundTertiary',
  'backgroundElevated',
  'surface',
  'surfaceElevated',
  'surfaceHover',
  'textPrimary',
  'textSecondary',
  'textTertiary',
  'textInverse',
  'border',
  'borderLight',
  'borderDark',
  'primary',
  'primaryDark',
  'primaryLight',
  'textOnPrimary',
];

export function paletteToCssVars(palette) {
  const vars = {};
  for (const key of TRANSITION_COLOR_KEYS) {
    const value = palette[key];
    if (value != null && value !== '') {
      vars[`--trak-${key}`] = value;
    }
  }
  vars['--trak-page-bg'] = palette.background;
  vars['--trak-page-fg'] = palette.textPrimary;
  return vars;
}

export function applyPaletteCssVars(root, palette) {
  const vars = paletteToCssVars(palette);
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}
