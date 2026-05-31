export const ADMIN_TAB_IDS = [
  'overview',
  'users',
  'admins',
  'articles',
  'feedback',
  'notifications',
  'settings',
];

export const ADMIN_TAB_ROUTES = ADMIN_TAB_IDS.map((id) => ({ key: id, title: id }));
