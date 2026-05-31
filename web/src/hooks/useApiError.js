import { useCallback } from 'react';
import { useUIFeedback } from '../components/ui/UIFeedback';
import { getUserFacingError } from '../utils/getUserFacingError';

export function useApiError() {
  const { error: showError } = useUIFeedback();

  const notifyApiError = useCallback(
    (err, context) => {
      showError(getUserFacingError(err, context));
    },
    [showError]
  );

  return { notifyApiError, getUserFacingError };
}
