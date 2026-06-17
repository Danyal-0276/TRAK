import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Database,
  Download,
  FileText,
  HardDrive,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Video,
} from 'lucide-react-native';
import { resolveTopInset } from '../../utils/screenSafeArea';
import { useTheme } from '../../theme/ThemeContext';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import Text from '../../components/ui/Text';
import { useStackBackHandler } from '../../hooks/useStackBackHandler';
import { goBackOrReturnToTab } from '../../navigation/appStackNavigation';
import {
  STORAGE_CATEGORIES,
  buildAsyncStorageExport,
  calculateAsyncStorageSummary,
  clearAsyncStorageByType,
  formatBytes,
  getPercentage,
  getUsageTone,
} from '../../utils/deviceStorageStats';

const CATEGORY_ICONS = {
  articles: FileText,
  images: ImageIcon,
  videos: Video,
  cache: RefreshCw,
  other: Database,
};

const EMPTY_SUMMARY = {
  total: 0,
  used: 0,
  available: 0,
  breakdown: { articles: 0, images: 0, videos: 0, cache: 0, other: 0 },
};

function ActionRow({ icon: Icon, title, subtitle, onPress, loading, danger, colors, isLast }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.75}
      style={[
        styles.actionRow,
        {
          borderBottomColor: colors.borderLight,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          opacity: loading ? 0.65 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: danger ? 'rgba(239,68,68,0.1)' : `${colors.primary || '#2563eb'}12` }]}>
        {loading ? (
          <ActivityIndicator size="small" color={danger ? '#ef4444' : colors.primary} />
        ) : (
          <Icon size={18} color={danger ? '#ef4444' : colors.textSecondary} strokeWidth={2.25} />
        )}
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, { color: danger ? '#ef4444' : colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const DataScreen = ({ navigation, route }) => {
  const returnTab = String(route?.params?.returnTab || 'Profile');
  useStackBackHandler(navigation, true, returnTab);

  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const insets = useSafeAreaInsets();
  const topInset = resolveTopInset(insets, 0);
  const isDark = theme.mode === 'dark';
  const { confirm, success, error: showError } = useFeedback();

  const [storageData, setStorageData] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(null);

  const cardBg = isDark ? colors.surfaceElevated || colors.surface : colors.surface;
  const accentSoft = colors.primary ? `${colors.primary}18` : isDark ? 'rgba(255,255,255,0.06)' : '#eff6ff';

  const refreshStorage = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    else setLoading(true);
    try {
      const summary = await calculateAsyncStorageSummary();
      setStorageData(summary);
    } catch (err) {
      console.error('Error calculating storage:', err);
      showError('Could not read storage usage.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    refreshStorage(false);
  }, [refreshStorage]);

  const usedPercent = getPercentage(storageData.used, storageData.total);
  const usageTone = getUsageTone(usedPercent);

  const segmentedBar = useMemo(() => {
    if (!storageData.used) return [];
    return STORAGE_CATEGORIES.map((cat) => ({
      ...cat,
      width: (storageData.breakdown[cat.key] / storageData.used) * 100,
    })).filter((segment) => segment.width > 0);
  }, [storageData]);

  const handleBack = () => goBackOrReturnToTab(navigation, returnTab);

  const clearData = async (type) => {
    const labels = {
      cache: 'cache and temporary files',
      articles: 'saved articles, bookmarks, and reactions',
      all: 'all local data except your login and theme',
    };

    const accepted = await confirm({
      title: `Clear ${type === 'all' ? 'all data' : type}?`,
      message: `This will remove ${labels[type] || type}. This cannot be undone.`,
      confirmText: 'Clear',
      danger: true,
    });
    if (!accepted) return;

    setClearing(type);
    try {
      await clearAsyncStorageByType(type);
      await refreshStorage(false);
      success('Storage cleared.');
    } catch (err) {
      console.error('Error clearing data:', err);
      showError('Failed to clear data.');
    } finally {
      setClearing(null);
    }
  };

  const exportData = async () => {
    try {
      const payload = await buildAsyncStorageExport();
      const json = JSON.stringify(payload, null, 2);
      await Share.share({
        title: 'TRAK data export',
        message: json,
      });
    } catch (err) {
      console.error('Error exporting data:', err);
      showError('Failed to export data.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.25} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text variant="title" style={{ color: colors.textPrimary }}>Data & Storage</Text>
          <Text variant="caption" color={colors.textSecondary}>
            Local data kept on this device
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => refreshStorage(true)} tintColor={colors.primary} />
        }
      >
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: colors.borderLight }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: accentSoft }]}>
              <HardDrive size={22} color={colors.primary || colors.textPrimary} strokeWidth={2.25} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>On this device</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                App storage used by TRAK on this phone
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => refreshStorage(false)}
              disabled={loading}
              style={[styles.refreshBtn, { borderColor: colors.borderLight, backgroundColor: accentSoft }]}
            >
              <RefreshCw size={14} color={colors.textSecondary} strokeWidth={2.25} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Calculating storage…</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                {[
                  { label: 'Used', value: formatBytes(storageData.used), color: usageTone.color },
                  { label: 'Free', value: formatBytes(storageData.available), color: colors.textPrimary },
                  { label: 'Budget', value: formatBytes(storageData.total), color: colors.textSecondary },
                ].map((stat) => (
                  <View key={stat.label} style={[styles.statCard, { backgroundColor: accentSoft, borderColor: colors.borderLight }]}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                    <Text style={[styles.statValue, { color: stat.color }]} numberOfLines={1}>{stat.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.usageRow}>
                <Text style={[styles.usageLabel, { color: colors.textPrimary }]}>{usedPercent}% used</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {formatBytes(storageData.used)} of {formatBytes(storageData.total)}
                </Text>
              </View>

              <View style={[styles.progressTrack, { backgroundColor: isDark ? '#334155' : '#e5e7eb' }]}>
                {segmentedBar.length ? (
                  segmentedBar.map((segment) => (
                    <View
                      key={segment.key}
                      style={{
                        width: `${segment.width}%`,
                        backgroundColor: segment.color,
                        height: '100%',
                      }}
                    />
                  ))
                ) : (
                  <View style={{ width: `${usedPercent}%`, backgroundColor: usageTone.color, height: '100%' }} />
                )}
              </View>

              <View style={styles.breakdownGrid}>
                {STORAGE_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.key];
                  const size = storageData.breakdown[cat.key] || 0;
                  return (
                    <View
                      key={cat.key}
                      style={[styles.breakdownCard, { backgroundColor: accentSoft, borderColor: colors.borderLight }]}
                    >
                      <View style={styles.breakdownHeader}>
                        <Icon size={15} color={cat.color} strokeWidth={2.25} />
                        <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                          {cat.label}
                        </Text>
                      </View>
                      <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>{formatBytes(size)}</Text>
                      <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                        {getPercentage(size, storageData.total)}% of budget
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Manage storage</Text>
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: colors.borderLight }]}>
          <ActionRow
            icon={RefreshCw}
            title="Clear cache"
            subtitle="Remove temporary files and cached responses"
            onPress={() => clearData('cache')}
            loading={clearing === 'cache'}
            colors={colors}
          />
          <ActionRow
            icon={FileText}
            title="Clear articles & bookmarks"
            subtitle="Remove saved articles, bookmarks, and reactions"
            onPress={() => clearData('articles')}
            loading={clearing === 'articles'}
            colors={colors}
          />
          <ActionRow
            icon={Trash2}
            title="Clear all local data"
            subtitle="Keeps your login session and theme preference"
            onPress={() => clearData('all')}
            loading={clearing === 'all'}
            danger
            colors={colors}
            isLast
          />
        </View>

        <View style={[styles.exportCard, { backgroundColor: cardBg, borderColor: colors.borderLight }]}>
          <View style={[styles.exportIcon, { backgroundColor: accentSoft }]}>
            <Download size={20} color={colors.primary || colors.textPrimary} strokeWidth={2.25} />
          </View>
          <View style={styles.exportCopy}>
            <Text style={[styles.exportTitle, { color: colors.textPrimary }]}>Export your data</Text>
            <Text style={[styles.exportSubtitle, { color: colors.textSecondary }]}>
              Share a JSON copy of your profile, bookmarks, and preferences stored on this device.
            </Text>
            <TouchableOpacity
              onPress={exportData}
              activeOpacity={0.8}
              style={[styles.exportBtn, { backgroundColor: colors.textPrimary }]}
            >
              <Download size={16} color={colors.surface} strokeWidth={2.25} />
              <Text style={[styles.exportBtnText, { color: colors.surface }]}>Share export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, minWidth: 0 },
  heroCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 18,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, minWidth: 0 },
  heroTitle: { fontSize: 17, fontWeight: '700' },
  heroSubtitle: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBlock: { alignItems: 'center', paddingVertical: 28 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700' },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: { fontSize: 14, fontWeight: '700' },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 14,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  breakdownCard: {
    width: '48.5%',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  breakdownLabel: { fontSize: 12, fontWeight: '600', flex: 1 },
  breakdownValue: { fontSize: 16, fontWeight: '700' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 2,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1, minWidth: 0 },
  actionTitle: { fontSize: 15, fontWeight: '700' },
  actionSubtitle: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  exportCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
  },
  exportIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportCopy: { flex: 1, minWidth: 0 },
  exportTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  exportSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  exportBtn: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportBtnText: { fontSize: 14, fontWeight: '700' },
});

export default DataScreen;
