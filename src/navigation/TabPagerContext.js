import { createContext, useContext } from 'react';

export const TabPagerContext = createContext(null);

export function useTabPager() {
  return useContext(TabPagerContext);
}
