import React from 'react';
import { Text } from 'react-native';

export const getIcon = (type, keyword, size = 52) => {
  const iconMap = {
    mention: '@',
    keyword: '#',
    keyword_match: '#',
    like: '❤️',
    comment: '💬',
    follow: '👤',
    message: '💭',
    system: '🔔',
    welcome_back: '👋',
  };

  const char = iconMap[type] || '📱';
  const fontSize = type === 'keyword' || type === 'keyword_match'
    ? Math.round(size * 0.46)
    : Math.round(size * 0.38);

  return (
    <Text style={{ fontSize, color: '#FFFFFF', fontWeight: 'bold', lineHeight: fontSize + 2 }}>
      {char}
    </Text>
  );
};
