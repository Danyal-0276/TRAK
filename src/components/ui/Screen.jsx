import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';

const Screen = ({ children, gradient = false, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      {gradient ? (
        <LinearGradient
          colors={[colors.background, colors.backgroundSecondary]}
          style={{ flex: 1 }}
        >
          <View style={[{ flex: 1, paddingHorizontal: 16 }, style]}>{children}</View>
        </LinearGradient>
      ) : (
        <View style={[{ flex: 1, paddingHorizontal: 16 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

export default Screen;
