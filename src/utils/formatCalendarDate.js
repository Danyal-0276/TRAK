/**
 * Format API datetimes as calendar dates without local timezone off-by-one shifts.
 */
export function formatCalendarDate(value, options = {}) {
  if (value == null || value === '') return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  const stable = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
  return stable.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}
