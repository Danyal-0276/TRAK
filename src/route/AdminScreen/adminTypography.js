/**
 * Admin semantic text roles → shared app Text variants (ThemeContext.typography).
 */

export const ADMIN_TEXT_VARIANTS = {
  eyebrow: 'caption',
  pageTitle: 'title',
  sectionTitle: 'subtitle',
  body: 'body',
  caption: 'caption',
  button: 'button',
  chip: 'caption',
  kpiValue: 'title',
  kpiLabel: 'caption',
};

/** Optional style overrides per role (keep minimal — prefer variants). */
export const ADMIN_TEXT_STYLE = {
  eyebrow: { fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  sectionTitle: { fontWeight: '700' },
  chip: { fontWeight: '600', fontSize: 12 },
  chipActive: { fontWeight: '700', fontSize: 12 },
  label: { fontWeight: '600' },
  kpiLabel: { fontWeight: '500', marginTop: 6 },
};

export function getAdminTextVariant(role) {
  return ADMIN_TEXT_VARIANTS[role] || 'body';
}

export function getAdminTextStyle(role, themeTypography) {
  const variant = getAdminTextVariant(role);
  const base = themeTypography?.[variant] || themeTypography?.body || {};
  const extra = ADMIN_TEXT_STYLE[role] || {};
  return { ...base, ...extra };
}

export function buildAdminType(theme) {
  const typography = theme?.typography || {};
  return {
    variant: getAdminTextVariant,
    style: (role) => getAdminTextStyle(role, typography),
    variants: ADMIN_TEXT_VARIANTS,
  };
}
