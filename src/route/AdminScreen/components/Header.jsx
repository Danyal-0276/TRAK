import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Shield size={28} color="#000" strokeWidth={2.5} />
        <Text style={styles.headerTitle}>Admin Panel</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 12,
  },
});

export default Header;