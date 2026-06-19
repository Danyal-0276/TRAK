import React from 'react';

/** Native-linked font family names (see assets/fonts + react-native.config.js). */
export const APP_FONTS = {
  body: 'Inter_400Regular',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  heading: 'SpaceGrotesk_600SemiBold',
  headingBold: 'SpaceGrotesk_700Bold',
  headingRegular: 'SpaceGrotesk_400Regular',
};

/** Bare RN: fonts are bundled via react-native.config.js — no expo-font runtime load. */
export function AppFontLoader({ children }) {
  return children;
}

export default AppFontLoader;
