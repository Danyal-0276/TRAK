import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Database,
  Download,
  FileText,
  HardDrive,
  Image,
  RefreshCw,
  Trash2,
  Video,
} from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { themedPageRoot } from '../../theme/themePageStyles';
import { SkeletonStatCards, SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';
import {
  STORAGE_CATEGORIES,
  buildLocalStorageExport,
  calculateLocalStorageSummary,
  clearLocalStorageByType,
  downloadJsonExport,
  formatBytes,
  getPercentage,
  getUsageTone,
} from '../../utils/deviceStorageStats';

const CATEGORY_ICONS = {
  articles: FileText,
  images: Image,
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

const DataScreen = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const { confirm, error: showError, success } = useUIFeedback();

  const [storageData, setStorageData] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(null);

  const refreshStorage = useCallback(() => {
    setLoading(true);
    try {
      setStorageData(calculateLocalStorageSummary());
    } catch (err) {
      console.error('Error calculating storage:', err);
      showError('Could not read storage usage.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    refreshStorage();
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

  const clearData = async (type) => {
    const labels = {
      cache: 'cache & temporary files',
      articles: 'saved articles and bookmarks',
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
      await new Promise((resolve) => setTimeout(resolve, 350));
      clearLocalStorageByType(type);
      refreshStorage();
      success('Storage cleared.');
    } catch (err) {
      console.error('Error clearing data:', err);
      showError('Failed to clear data. Please try again.');
    } finally {
      setClearing(null);
    }
  };

  const exportData = () => {
    try {
      downloadJsonExport(buildLocalStorageExport());
      success('Export started.');
    } catch (err) {
      console.error('Error exporting data:', err);
      showError('Failed to export data.');
    }
  };

  const cardBg = colors.surface;
  const border = colors.borderLight || colors.border;
  const mutedBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';

  return (
    <div style={themedPageRoot(colors)}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '20px 24px 48px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 0',
            border: 'none',
            background: 'transparent',
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: colors.textPrimary, margin: '0 0 8px', letterSpacing: '-0.4px' }}>
            Data & Storage
          </h1>
          <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.55 }}>
            See what TRAK keeps on this browser and free up space when you need to.
          </p>
        </div>

        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 18,
            padding: 28,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: isDark ? 'rgba(255,255,255,0.06)' : `${colors.primary || '#2563eb'}14`,
                }}
              >
                <HardDrive size={22} color={colors.primary || colors.textPrimary} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary }}>On this device</div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  Browser local storage for TRAK
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={refreshStorage}
              disabled={loading}
              style={{
                border: `1px solid ${border}`,
                background: mutedBg,
                color: colors.textSecondary,
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div>
              <SkeletonStatCards count={3} isDark={isDark} colors={colors} />
              <div style={{ marginTop: 20 }}>
                <SkeletonListRows rows={5} isDark={isDark} colors={colors} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 22 }}>
                {[
                  { label: 'Used', value: formatBytes(storageData.used), accent: usageTone.color },
                  { label: 'Available', value: formatBytes(storageData.available), accent: colors.textPrimary },
                  { label: 'Budget', value: formatBytes(storageData.total), accent: colors.textSecondary },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: mutedBg,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6, fontWeight: 600 }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: stat.accent }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                  {usedPercent}% used
                </span>
                <span style={{ fontSize: 13, color: colors.textSecondary }}>
                  {formatBytes(storageData.used)} of {formatBytes(storageData.total)}
                </span>
              </div>

              <div
                style={{
                  height: 12,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: isDark ? '#334155' : '#e5e7eb',
                  display: 'flex',
                  marginBottom: 22,
                }}
              >
                {segmentedBar.length ? (
                  segmentedBar.map((segment) => (
                    <div
                      key={segment.key}
                      style={{
                        width: `${segment.width}%`,
                        background: segment.color,
                        minWidth: segment.width > 0 ? 4 : 0,
                      }}
                    />
                  ))
                ) : (
                  <div style={{ width: `${usedPercent}%`, background: usageTone.color }} />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {STORAGE_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.key];
                  const size = storageData.breakdown[cat.key] || 0;
                  return (
                    <div
                      key={cat.key}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: `1px solid ${border}`,
                        background: mutedBg,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Icon size={16} color={cat.color} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{cat.label}</span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary }}>{formatBytes(size)}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                        {getPercentage(size, storageData.total)}% of budget
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textSecondary, marginBottom: 10 }}>
            Manage storage
          </div>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 18, overflow: 'hidden' }}>
            {[
              {
                key: 'cache',
                title: 'Clear cache',
                subtitle: 'Remove temporary files and cached responses',
                icon: RefreshCw,
                danger: false,
              },
              {
                key: 'articles',
                title: 'Clear articles & bookmarks',
                subtitle: 'Remove saved articles and offline bookmark copies',
                icon: FileText,
                danger: false,
              },
              {
                key: 'all',
                title: 'Clear all local data',
                subtitle: 'Keeps your login session and theme preference',
                icon: Trash2,
                danger: true,
              },
            ].map((action, index, list) => (
              <button
                key={action.key}
                type="button"
                onClick={() => clearData(action.key)}
                disabled={clearing === action.key}
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: index < list.length - 1 ? `1px solid ${border}` : 'none',
                  background: cardBg,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: clearing === action.key ? 'not-allowed' : 'pointer',
                  opacity: clearing === action.key ? 0.65 : 1,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      display: 'grid',
                      placeItems: 'center',
                      background: action.danger ? '#fef2f2' : mutedBg,
                    }}
                  >
                    <action.icon size={18} color={action.danger ? '#ef4444' : colors.textSecondary} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: action.danger ? '#ef4444' : colors.textPrimary }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{action.subtitle}</div>
                  </div>
                </div>
                {clearing === action.key ? (
                  <RefreshCw size={16} color={colors.textSecondary} style={{ animation: 'spin 1s linear infinite' }} />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 18,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                background: isDark ? 'rgba(255,255,255,0.06)' : `${colors.primary || '#2563eb'}14`,
              }}
            >
              <Download size={20} color={colors.primary || colors.textPrimary} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
                Export your data
              </div>
              <p style={{ fontSize: 14, color: colors.textSecondary, margin: '0 0 16px', lineHeight: 1.6 }}>
                Download a JSON copy of your profile, settings, and bookmarks stored in this browser.
              </p>
              <button
                type="button"
                onClick={exportData}
                style={{
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 18px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#fff',
                  background: isDark ? '#334155' : colors.textPrimary || '#0f172a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Download size={16} />
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DataScreen;
