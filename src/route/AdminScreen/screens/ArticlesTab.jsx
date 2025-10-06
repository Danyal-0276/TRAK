import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';

const ArticlesTab = ({ articles, searchQuery, onSearchChange, onEdit, onDelete }) => {
  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <Text style={styles.sectionTitle}>Articles Management</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search articles..."
      />

      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  managementSection: {
    paddingHorizontal: 20,
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});

export default ArticlesTab;