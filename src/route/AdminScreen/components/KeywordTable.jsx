import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const KeywordTable = ({ keywords }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Top 5 Keywords</Text>
      
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>#</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderWords]}>Words</Text>
        <Text style={styles.tableHeaderTexts}>Searches</Text>
      </View>

      {keywords.map((keyword) => (
        <View key={keyword.id} style={styles.tableRow}>
          <Text style={styles.tableCell}>{keyword.id}</Text>
          <Text style={[styles.tableCell, styles.tableCellWord]}>{keyword.word}</Text>
          <Text style={styles.tableCell}>{keyword.searches}</Text>
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
    color: '#000',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: '15%',
  },
  tableHeaderTexts: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: '30%',
  },
  tableHeaderWords: {
    width: '55%',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 15,
    color: '#000',
    width: '15%',
    fontWeight: '500',
  },
  tableCellWord: {
    width: '55%',
    fontWeight: '600',
  },
});

export default KeywordTable;