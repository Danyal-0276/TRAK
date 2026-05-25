import { useTabPager } from './TabPagerContext';

/** Switch main tab from any screen inside MainTabs (swipe pager). */
export function useGoToMainTab() {
  const pager = useTabPager();
  return (screenName) => {
    if (pager?.jumpToTab) {
      pager.jumpToTab(screenName);
      return;
    }
  };
}

export function goToMainTab(navigation, screenName) {
  const jump = navigation?.__tabPagerJump;
  if (typeof jump === 'function') {
    jump(screenName);
    return;
  }
  navigation?.getParent?.()?.navigate?.('MainTabs', { screen: screenName });
}
