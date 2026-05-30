import { useRef, useCallback, useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { setTabBarHidden } from '../navigation/tabBarVisibility';

const HEADER_ANIM_MS = 200;

/**
 * Collapsible fixed header: hide on scroll down, show on scroll up (~200ms).
 * @param {{ hideOffset?: number, hideThreshold?: number, showAtTop?: number, scrollDiffMin?: number, syncTabBar?: boolean }} [options]
 */
export function useCollapsibleHeader({
  hideOffset = 110,
  hideThreshold = 50,
  showAtTop = 10,
  scrollDiffMin = 5,
  syncTabBar = true,
} = {}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerHiddenRef = useRef(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const hideOffsetRef = useRef(hideOffset);

  useEffect(() => {
    hideOffsetRef.current = hideOffset;
  }, [hideOffset]);

  const animateTo = useCallback(
    (hidden) => {
      if (headerHiddenRef.current === hidden) return;
      headerHiddenRef.current = hidden;
      setHeaderHidden(hidden);
      if (syncTabBar) setTabBarHidden(hidden);
      translateY.stopAnimation();
      Animated.timing(translateY, {
        toValue: hidden ? -Math.max(1, hideOffsetRef.current) : 0,
        duration: HEADER_ANIM_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [syncTabBar, translateY]
  );

  const showHeader = useCallback(() => animateTo(false), [animateTo]);
  const hideHeader = useCallback(() => animateTo(true), [animateTo]);

  const handleScroll = useCallback(
    (event) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const diff = currentY - lastScrollY.current;

      if (currentY <= showAtTop && headerHiddenRef.current) {
        showHeader();
        lastScrollY.current = currentY;
        return;
      }

      if (Math.abs(diff) < scrollDiffMin) {
        lastScrollY.current = currentY;
        return;
      }

      const direction = diff > 0 ? 'down' : 'up';

      if (direction === 'down' && currentY > hideThreshold && !headerHiddenRef.current) {
        hideHeader();
      } else if (direction === 'up' && headerHiddenRef.current) {
        showHeader();
      }

      lastScrollY.current = currentY;
    },
    [hideThreshold, showAtTop, scrollDiffMin, showHeader, hideHeader]
  );

  return {
    translateY,
    handleScroll,
    showHeader,
    hideHeader,
    headerHidden,
    headerHiddenRef,
  };
}
