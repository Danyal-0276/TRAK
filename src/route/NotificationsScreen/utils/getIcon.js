// src/utils/getIcon.js
import React from 'react';
import { Text } from 'react-native';

export const getIcon = (type, keyword) => {
  const getIconChar = (iconType) => {
    const iconMap = {
      'mention': '@',
      'keyword': '#',
      'like': '❤️',
      'comment': '💬',
      'follow': '👤',
      'message': '💭',
      'system': '🔔'
    };
    return iconMap[iconType] || '📱';
  };

  return (
    <Text style={{ fontSize: 20, color: "#FFFFFF", fontWeight: "bold" }}>
      {getIconChar(type)}
    </Text>
  );
};