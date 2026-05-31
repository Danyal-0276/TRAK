import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FileText } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { getAdminDashboardPalette } from '../adminTheme';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import Text from '../../../components/ui/Text';
import EmptyState from '../components/EmptyState';
import AdminListRowSkeleton from '../components/skeletons/AdminListRowSkeleton';
import { ADMIN_TEXT_STYLE } from '../adminTypography';

const PIPELINES = [
  { id: '', label: 'Any status' },
  { id: 'queue', label: 'Queue' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'done', label: 'Done (processed feed)' },
  { id: 'failed', label: 'Failed' },
];

const ArticlesTab = ({
  articles,
  searchQuery,
  onSearchChange,
  onViewArticle,
  onReviewArticle,
  onDelete,
  pipelineFilter = '',
  onPipelineFilterChange,
  loading = false,
  palette: paletteProp,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const palette = { ...getAdminDashboardPalette(theme.colors, isDark), ...(paletteProp || {}), isDark };

  const pipelineChipStyle = (active) => [
    styles.pipelineChip,
    {
      borderColor: active ? palette.chart?.secondary || palette.primary : palette.border,
      backgroundColor: active ? `${palette.chart?.secondary || palette.primary}18` : palette.pageAlt,
    },
  ];

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: palette.infoBg }]}>
            <FileText size={20} color={palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle" color={palette.textPrimary} style={ADMIN_TEXT_STYLE.sectionTitle}>
              Articles Management
            </Text>
            <Text variant="caption" color={palette.textSecondary} style={{ marginTop: 4, lineHeight: 18 }}>
              Live list from MongoDB — filter by pipeline status.
            </Text>
          </View>
        </View>
      </View>

      {onPipelineFilterChange ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pipelineRow}>
          {PIPELINES.map((p) => {
            const active = pipelineFilter === p.id;
            return (
              <TouchableOpacity
                key={p.id || 'any'}
                onPress={() => onPipelineFilterChange(p.id)}
                style={pipelineChipStyle(active)}
              >
                <Text
                  variant="caption"
                  color={active ? palette.textPrimary : palette.textTertiary}
                  style={active ? ADMIN_TEXT_STYLE.chipActive : ADMIN_TEXT_STYLE.chip}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      <SearchBar value={searchQuery} onChangeText={onSearchChange} placeholder="Search articles by title, source, or category..." />

      {loading ? (
        <AdminListRowSkeleton palette={palette} count={6} />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No articles found"
          subtitle={searchQuery ? 'Try adjusting your search' : 'No articles match these filters'}
        />
      ) : (
        articles.map((article) => (
          <ArticleCard
            key={`${article.scope}-${article.id}`}
            article={article}
            palette={palette}
            onView={onViewArticle}
            onReview={onReviewArticle}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  managementSection: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  managementHeader: { marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pipelineRow: { gap: 8, paddingBottom: 12 },
  pipelineChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
});

export default React.memo(ArticlesTab);
