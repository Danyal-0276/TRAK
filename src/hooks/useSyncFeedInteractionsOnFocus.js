import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { syncFeedInteractionsFromStorage } from '../utils/syncFeedInteractions';

/** Re-apply bookmark/vote state from device storage when a feed screen regains focus. */
export function useSyncFeedInteractionsOnFocus({
  setVotedItems,
  setBookmarkedItems,
  setNewsData,
} = {}) {
  useFocusEffect(
    useCallback(() => {
      syncFeedInteractionsFromStorage({
        setVotedItems,
        setBookmarkedItems,
        setNewsData,
      }).catch(() => {});
    }, [setVotedItems, setBookmarkedItems, setNewsData]),
  );
}
