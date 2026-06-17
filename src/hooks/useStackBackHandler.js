import { useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { goBackOrReturnToTab } from '../navigation/appStackNavigation';

/**
 * Route hardware back through the stack.
 * When there is nowhere to go back, run fallback (defaults to returning to Profile tab)
 * so Android does not treat back as "exit app".
 */
export function useStackBackHandler(navigation, enabled = true, returnTab = 'Profile') {
  const handleBack = useCallback(() => {
    return goBackOrReturnToTab(navigation, returnTab);
  }, [navigation, returnTab]);

  useEffect(() => {
    if (!enabled) return undefined;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => handleBack());

    return () => sub.remove();
  }, [enabled, handleBack]);
}

export { goBackOrReturnToTab };
