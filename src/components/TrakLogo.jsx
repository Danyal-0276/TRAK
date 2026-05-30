import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import BlackLogo from '../assets/images/blackLogo.svg';
import WhiteLogo from '../assets/images/whiteLogo.svg';

/**
 * Theme-aware TRAK mark: black logo on light, white logo on dark.
 */
export default function TrakLogo({ size = 32, style, showContainer = false }) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const { colors } = theme;
  const Logo = isDark ? WhiteLogo : BlackLogo;

  const mark = <Logo width={size} height={size} />;

  if (!showContainer) {
    return <View style={style}>{mark}</View>;
  }

  return (
    <View
      style={[
        {
          width: size + 12,
          height: size + 12,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.backgroundSecondary,
        },
        style,
      ]}
    >
      {mark}
    </View>
  );
}
