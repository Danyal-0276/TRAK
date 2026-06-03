import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdminTheme } from '../useAdminTheme';

const KeywordTable = ({ keywords }) => {
  const { palette } = useAdminTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Top 5 Keywords</Text>

      <View style={[styles.tableHeader, { borderBottomColor: palette.borderLight }]}>
        <Text style={[styles.tableHeaderText, { color: palette.textSecondary }]}>#</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderWords, { color: palette.textSecondary }]}>
          Words
        </Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderTexts, { color: palette.textSecondary }]}>
          Searches
        </Text>
      </View>

      {keywords.map((keyword) => (
        <View key={keyword.id} style={[styles.tableRow, { borderBottomColor: palette.borderLight }]}>
          <Text style={[styles.tableCell, { color: palette.textPrimary }]}>{keyword.id}</Text>
          <Text style={[styles.tableCell, styles.tableCellWord, { color: palette.textPrimary }]}>
            {keyword.word}
          </Text>
          <Text style={[styles.tableCell, { color: palette.textPrimary }]}>{keyword.searches}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    width: '15%',
  },
  tableHeaderTexts: {
    width: '30%',
  },
  tableHeaderWords: {
    width: '55%',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 15,
    width: '15%',
    fontWeight: '500',
  },
  tableCellWord: {
    width: '55%',
    fontWeight: '600',
  },
});

export default KeywordTable;
