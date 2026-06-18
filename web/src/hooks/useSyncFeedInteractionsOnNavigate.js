import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { syncFeedInteractionsFromStorage } from '../utils/syncFeedInteractions';

/** Re-apply bookmark/vote state from local storage when navigating back to a feed route. */
export function useSyncFeedInteractionsOnNavigate({
  setVotedItems,
  setBookmarkedItems,
  setNewsData,
} = {}) {
  const location = useLocation();

  useEffect(() => {
    syncFeedInteractionsFromStorage({
      setVotedItems,
      setBookmarkedItems,
      setNewsData,
    });
  }, [location.key, setVotedItems, setBookmarkedItems, setNewsData]);
}
