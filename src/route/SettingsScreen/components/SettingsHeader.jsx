import React from 'react';
import { StyleSheet } from 'react-native';
import PageScreenHeader from '../../../components/ui/PageScreenHeader';

/** Matches Home FeedHeader chrome (logo + title, no accent band). */
export default function SettingsHeader() {
  return (
    <PageScreenHeader
      title="Settings"
      paddingTop={0}
      style={styles.noExtraBorder}
    />
  );
}

const styles = StyleSheet.create({
  noExtraBorder: {
    borderBottomWidth: 0,
    paddingBottom: 8,
  },
});
