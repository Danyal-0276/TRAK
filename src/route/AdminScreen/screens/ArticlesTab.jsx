import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  FileText,
  Rss,
  Eye,
  CheckCircle2,
  Inbox,
  Clock,
  Loader,
  XCircle,
  Workflow,
  Info,
} from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { getAdminDashboardPalette } from '../adminTheme';
import SearchBar from '../components/SearchBar';
import ArticleCard from '../components/ArticleCard';
import Text from '../../../components/ui/Text';
import EmptyState from '../components/EmptyState';
import AdminListRowSkeleton from '../components/skeletons/AdminListRowSkeleton';
import AdminArticleCountBar from '../components/AdminArticleCountBar';
import { NEEDS_REVIEW_HELP, FEED_FILTERS, PIPELINE_FILTERS } from '../../../utils/adminArticleFilters';

const FEED_ICONS = { '': Rss, review: Eye, approved: CheckCircle2 };
const PIPELINE_ICONS = { queue: Inbox, pending: Clock, processing: Loader, failed: XCircle };

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
  articleCounts = null,
  palette: paletteProp,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const palette = { ...getAdminDashboardPalette(theme.colors, isDark), ...(paletteProp || {}), isDark };
  const [helpOpen, setHelpOpen] = useState(false);

  const renderChip = (p, icons, isPipe = false) => {
    const active = pipelineFilter === p.id;
    const Icon = icons[p.id] || (isPipe ? Workflow : Rss);
    const statusColor = isPipe ? (palette.pipeline?.[p.id] || palette.textTertiary) : palette.textPrimary;
    const activeBg = isPipe
      ? `${statusColor}18`
      : (isDark ? 'rgba(255,255,255,0.12)' : palette.textPrimary);
    const activeColor = isPipe ? statusColor : (isDark ? palette.textPrimary : '#fff');

    return (
      <TouchableOpacity
        key={p.id || 'feed-default'}
        onPress={() => onPipelineFilterChange?.(p.id)}
        style={[
          isPipe ? styles.pipeChip : styles.feedChip,
          {
            borderColor: active ? (isPipe ? statusColor : palette.textPrimary) : palette.borderLight,
            backgroundColor: active ? activeBg : 'transparent',
          },
        ]}
      >
        <Icon size={isPipe ? 10 : 11} color={active ? activeColor : palette.textTertiary} />
        <Text
          variant="caption"
          style={{
            fontSize: isPipe ? 10 : 11,
            fontWeight: active ? '700' : '600',
            color: active ? activeColor : palette.textSecondary,
          }}
        >
          {p.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.managementSection}>
      <AdminArticleCountBar
        counts={articleCounts}
        pipelineFilter={pipelineFilter}
        displayedCount={articles.length}
        searchQuery={searchQuery}
        palette={palette}
        loading={loading}
      />

      {onPipelineFilterChange ? (
        <View style={[styles.filterBar, { borderColor: palette.border, backgroundColor: palette.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <Text variant="caption" color={palette.textTertiary} style={styles.tag}>
              Feed
            </Text>
            {FEED_FILTERS.map((p) => renderChip(p, FEED_ICONS))}
            <View style={[styles.sep, { backgroundColor: palette.borderLight }]} />
            <Text variant="caption" color={palette.textTertiary} style={styles.tag}>
              Raw
            </Text>
            {PIPELINE_FILTERS.map((p) => renderChip(p, PIPELINE_ICONS, true))}
            <TouchableOpacity onPress={() => setHelpOpen((v) => !v)} style={styles.infoBtn}>
              <Info size={13} color={palette.textTertiary} />
            </TouchableOpacity>
          </ScrollView>
          {helpOpen ? (
            <Text variant="caption" color={palette.textSecondary} style={[styles.help, { borderTopColor: palette.borderLight }]}>
              {NEEDS_REVIEW_HELP}
            </Text>
          ) : null}
        </View>
      ) : null}

      <SearchBar value={searchQuery} onChangeText={onSearchChange} placeholder="Search articles…" />

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
  filterBar: { borderWidth: 1, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  filterScroll: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 7 },
  tag: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 2 },
  feedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  pipeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  sep: { width: 1, height: 18, marginHorizontal: 4 },
  infoBtn: { marginLeft: 4, padding: 4 },
  help: { fontSize: 10, lineHeight: 14, paddingHorizontal: 10, paddingVertical: 7, borderTopWidth: 1 },
});

export default React.memo(ArticlesTab);
