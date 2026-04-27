const KEY = 'trak_web_push_token';

function randomToken() {
  return `trak-web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getOrCreatePushToken() {
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const token = randomToken();
  localStorage.setItem(KEY, token);
  return token;
}
