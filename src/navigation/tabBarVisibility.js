const listeners = new Set();
let isHidden = false;

export function setTabBarHidden(nextHidden) {
  const normalized = !!nextHidden;
  if (normalized === isHidden) return;
  isHidden = normalized;
  listeners.forEach((listener) => listener(isHidden));
}

export function subscribeTabBarVisibility(listener) {
  listeners.add(listener);
  listener(isHidden);
  return () => listeners.delete(listener);
}

export function resetTabBarVisibility() {
  setTabBarHidden(false);
}
