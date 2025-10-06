import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BarChart3, TrendingUp, Users, FileText, Bell, Settings as SettingsIcon } from 'lucide-react-native';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', icon: BarChart3 },
    { id: 'analytics', icon: TrendingUp },
    { id: 'users', icon: Users },
    { id: 'articles', icon: FileText },
    { id: 'notifications', icon: Bell },
    { id: 'settings', icon: SettingsIcon },
  ];

  return (
    <View style={styles.tabNav}>
      {tabs.map(({ id, icon: Icon }) => (
        <TouchableOpacity
          key={id}
          style={[styles.tabButton, activeTab === id && styles.tabButtonActive]}
          onPress={() => onTabChange(id)}
        >
          <Icon size={24} color={activeTab === id ? '#000' : '#666'} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabNav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#000',
  },
});

export default TabNavigation;