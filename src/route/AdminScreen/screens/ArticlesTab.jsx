import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FileText } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import Text from '../../../components/ui/Text';
import EmptyState from '../components/EmptyState';

const ArticlesTab = ({ articles, searchQuery, onSearchChange, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <FileText size={20} color={colors.primary} />
          </View>
          <Text variant="title" color={colors.textPrimary} style={styles.sectionTitle}>
            Articles Management
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search articles..."
      />

      {articles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No articles found"
          subtitle={searchQuery ? "Try a different search term" : "No articles available"}
        />
      ) : (
        articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  managementSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default ArticlesTab;