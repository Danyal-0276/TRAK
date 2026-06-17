/** Screens hosted on MainAppStack (inside root NewsFeed). */
const MAIN_STACK_MARKERS = new Set(['MainTabs', 'EditProfileScreen', 'SettingsHome']);

export function getMainStackNavigation(navigation) {
  let nav = navigation;
  while (nav) {
    const names = nav.getState?.()?.routeNames || [];
    if (names.some((name) => MAIN_STACK_MARKERS.has(name))) {
      return nav;
    }
    nav = nav.getParent?.();
  }
  return navigation.getParent?.() ?? navigation;
}

export function getRootNavigation(navigation) {
  let nav = navigation;
  let root = nav;
  while (nav?.getParent?.()) {
    nav = nav.getParent();
    root = nav;
  }
  return root ?? navigation;
}

export function pushMainStackScreen(navigation, screen, params) {
  const main = getMainStackNavigation(navigation);
  if (typeof main?.push === 'function') {
    main.push(screen, params);
    return;
  }
  main?.navigate?.(screen, params);
}

export function navigateRootScreen(navigation, screen, params) {
  getRootNavigation(navigation).navigate(screen, params);
}

export function navigateToSettings(navigation, { returnTab = 'Profile' } = {}) {
  pushMainStackScreen(navigation, 'SettingsHome', { returnTab });
}

export function returnToMainTab(navigation, tab = 'Profile') {
  getMainStackNavigation(navigation).navigate('MainTabs', { screen: tab });
}

/** Back one screen, or return to a main tab instead of exiting the app. */
export function goBackOrReturnToTab(navigation, tab = 'Profile') {
  if (goBackInNavigationTree(navigation)) {
    return true;
  }
  returnToMainTab(navigation, tab);
  return true;
}

/** Walk nested navigators so hardware back never skips an inner stack. */
export function goBackInNavigationTree(navigation) {
  let nav = navigation;
  while (nav) {
    if (nav.canGoBack?.()) {
      nav.goBack();
      return true;
    }
    nav = nav.getParent?.();
  }
  return false;
}

export function isSettingsFlowRoute(route) {
  const name = String(route?.name || '');
  return name === 'SettingsHome'
    || name.startsWith('Settings')
    || Boolean(route?.params?.fromSettings);
}
