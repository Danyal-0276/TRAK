import React, { useCallback, useMemo, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Platform } from 'react-native';
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
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Trash2,
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

const FEED_ICONS = { '': Rss, fake: AlertTriangle, suspicious: AlertCircle, review: Eye, approved: CheckCircle2 };
const PIPELINE_ICONS = { queue: Inbox, pending: Clock, processing: Loader, failed: XCircle };

const LIST_PERF = {
  initialNumToRender: 6,
  maxToRenderPerBatch: 4,
  windowSize: 5,
  updateCellsBatchingPeriod: 64,
  removeClippedSubviews: Platform.OS === 'android',
};

const AdminArticleRow = React.memo(
  function AdminArticleRow({ article, palette, handlersRef, showFailedActions, failedBulkBusy }) {
    const h = handlersRef.current;
    const ps = String(article.pipeline_status || '').toLowerCase();
    const canRequeue = showFailedActions && ['failed', 'processing'].includes(ps);
    return (
      <ArticleCard
        article={article}
        palette={palette}
        onView={h?.onView}
        onReview={h?.onReview}
        onDelete={h?.onDelete}
        onRequeue={canRequeue ? h?.onRequeue : undefined}
        requeueDisabled={failedBulkBusy}
      />
    );
  },
  (prev, next) =>
    prev.article === next.article &&
    prev.palette === next.palette &&
    prev.showFailedActions === next.showFailedActions &&
    prev.failedBulkBusy === next.failedBulkBusy
);

const ArticlesTab = ({
  articles,
  searchQuery,
  onSearchChange,
  onViewArticle,
  onReviewArticle,
  onDelete,
  onRequeue,
  onRequeueAllFailed,
  onDeleteAllFailed,
  failedBulkBusy = false,
  pipelineFilter = '',
  onPipelineFilterChange,
  loading = false,
  articleCounts = null,
  palette: paletteProp,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const palette = useMemo(
    () => ({ ...getAdminDashboardPalette(theme.colors, isDark), ...(paletteProp || {}), isDark }),
    [theme.colors, isDark, paletteProp]
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const handlersRef = useRef({ onView: onViewArticle, onReview: onReviewArticle, onDelete, onRequeue });
  handlersRef.current = { onView: onViewArticle, onReview: onReviewArticle, onDelete, onRequeue };
  const showFailedActions = pipelineFilter === 'failed';

  const renderChip = useCallback(
    (p, icons, isPipe = false) => {
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
    },
    [pipelineFilter, palette, isDark, onPipelineFilterChange]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
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

        {showFailedActions && onRequeueAllFailed && onDeleteAllFailed ? (
          <View
            style={[
              styles.failedBulkBar,
              {
                borderColor: palette.borderLight,
                backgroundColor: palette.pageAlt,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.failedBulkBtn, { borderColor: palette.border, backgroundColor: palette.card }]}
              onPress={onRequeueAllFailed}
              disabled={failedBulkBusy}
            >
              <RotateCcw size={14} color={palette.textPrimary} />
              <Text variant="caption" color={palette.textPrimary} style={styles.failedBulkBtnText}>
                Send all back to queue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.failedBulkBtn,
                styles.failedBulkBtnDanger,
                {
                  borderColor: `${palette.pipeline?.failed || palette.error}55`,
                  backgroundColor: palette.errorBg,
                },
              ]}
              onPress={onDeleteAllFailed}
              disabled={failedBulkBusy}
            >
              <Trash2 size={14} color={palette.pipeline?.failed || palette.error} />
              <Text
                variant="caption"
                style={[styles.failedBulkBtnText, { color: palette.pipeline?.failed || palette.error }]}
              >
                Delete all failed
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <SearchBar value={searchQuery} onChangeText={onSearchChange} placeholder="Search articles…" palette={palette} />
      </View>
    ),
    [
      articleCounts,
      pipelineFilter,
      articles.length,
      searchQuery,
      palette,
      loading,
      onPipelineFilterChange,
      helpOpen,
      renderChip,
      onSearchChange,
      showFailedActions,
      onRequeueAllFailed,
      onDeleteAllFailed,
      failedBulkBusy,
    ]
  );

  const keyExtractor = useCallback((item) => `${item.scope}-${item.id}`, []);

  const renderItem = useCallback(
    ({ item }) => (
      <AdminArticleRow
        article={item}
        palette={palette}
        handlersRef={handlersRef}
        showFailedActions={showFailedActions}
        failedBulkBusy={failedBulkBusy}
      />
    ),
    [palette, showFailedActions, failedBulkBusy]
  );

  if (loading && articles.length === 0) {
    return (
      <View style={styles.root}>
        {listHeader}
        <AdminListRowSkeleton palette={palette} count={6} />
      </View>
    );
  }

  if (!loading && articles.length === 0) {
    return (
      <View style={styles.root}>
        {listHeader}
        <EmptyState
          icon={FileText}
          title="No articles found"
          subtitle={searchQuery ? 'Try adjusting your search' : 'No articles match these filters'}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      data={articles}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...LIST_PERF}
    />
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  headerBlock: { paddingTop: 8 },
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
  failedBulkBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  failedBulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  failedBulkBtnDanger: {},
  failedBulkBtnText: { fontSize: 12, fontWeight: '600' },
});

export default React.memo(ArticlesTab);
