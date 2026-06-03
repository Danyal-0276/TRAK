import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
  AppState,
  useWindowDimensions,
} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useAdminTheme } from './useAdminTheme';
import { useAuth } from '../../context/AuthContext';
import {
  deleteAdminUser,
  deleteAdminArticle,
  getAdminArticles,
  getAdminNotifications,
  getAdminSettings,
  getAdminUsers,
  patchAdminSettings,
  patchAdminUser,
  postAdminCreate,
  postAdminPipelineRun,
  postAdminScrapeRun,
  postAdminScrapeAndPipelineRun,
  createAdminCategory,
  deleteAdminCategory,
  addAdminSubcategory,
  deleteAdminSubcategory,
  createAdminConnection,
  deleteAdminConnection,
} from '../../api/adminApi';
import { loadAdminOverview } from './loadAdminOverview';
import { DASHBOARD_POLL_INTERVAL_MS, ARTICLES_POLL_INTERVAL_MS } from './adminTheme';
import { analyticsSnapshotSignature } from './analyticsSnapshotSig';
import {
  buildDashboardStatCards,
  KPI_TAB_NAV,
  emptyAnalyticsSnapshot,
  enrichAnalyticsSnapshot,
  isAnalyticsPayload,
} from './dashboardChartUtils';
import { normAdminCategories, normAdminConnections } from '../../utils/adminLists';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import DashboardTab from './screens/DashboardTab';
import AnalyticsTab from './screens/AnalyticsTab';
import UsersTab from './screens/UsersTab';
import AdminsTab from './screens/AdminsTab';
import ArticlesTab from './screens/ArticlesTab';
import NotificationsTab from './screens/NotificationsTab';
import FeedbackTab from './screens/FeedbackTab';
import SettingsTab from './screens/SettingsTab';
import AdminArticleReviewModal from './components/AdminArticleReviewModal';
import EditModal from './components/EditModal';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import { buildArticleDetailParams } from '../../utils/articleNavigation';
import { getArticlesFetchParams, filterArticlesForDisplay } from '../../utils/adminArticleFilters';
import { ADMIN_TAB_ROUTES } from '../../navigation/adminTabIds';
import { openAdminNotificationsSocket } from '../../api/adminNotificationsRealtime';
import { dispatchAdminFeedbackRefresh } from '../../utils/adminNotificationsEvents';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PIPELINE_BATCH_SIZE = 15;
const SCRAPE_ONLY_LIMIT = 40;
const SCRAPE_AND_PIPELINE = { scrapeLimit: 40, pipelineLimit: 200 };

function mapAdminArticleRow(doc) {
  const dateStr = doc.fetched_at || doc.processed_at || '';
  const shortDate =
    typeof dateStr === 'string' ? dateStr.slice(0, 16).replace('T', ' ') : String(dateStr || '');
  const excerpt = doc.description || doc.summary || '';
  const fullContent = doc.content || doc.description || doc.summary || doc.canonical_url || '';
  return {
    id: doc.id,
    scope: doc.scope,
    title: doc.title || '(no title)',
    author: doc.source_key || (doc.canonical_url ? String(doc.canonical_url).slice(0, 48) : '—'),
    source: doc.source_key || '—',
    category: doc.scope === 'raw' ? 'Raw' : 'Processed',
    status: doc.scope === 'raw' ? String(doc.pipeline_status ?? 'pending') : String(doc.credibility_label_name ?? '—'),
    date: shortDate || '—',
    time: shortDate || '—',
    fromApi: true,
    fetched_at: doc.fetched_at,
    processed_at: doc.processed_at,
    canonical_url: doc.canonical_url,
    excerpt,
    description: excerpt,
    ai_summary: doc.summary || '',
    fullContent,
    content: fullContent,
    pipeline_status: doc.pipeline_status,
    moderation_status: doc.moderation_status,
    credibility_label: doc.credibility_label,
    credibility_label_name: doc.credibility_label_name,
    credibility_score: doc.credibility_score,
    credibility_probs: doc.credibility_probs,
    credibility_max_prob: doc.credibility_max_prob,
    fake_detection_label: doc.fake_detection_label,
    fact_check_verdict: doc.fact_check_verdict,
    fact_check_hits: doc.fact_check_hits,
    fact_check_provider: doc.fact_check_provider,
    credibility_confidence_pct: doc.credibility_confidence_pct,
    credibility_prob_breakdown: doc.credibility_prob_breakdown,
    credibility_label_prob: doc.credibility_label_prob,
    image_url: doc.image_url,
    source_key: doc.source_key,
    topic_keywords: doc.topic_keywords || [],
  };
}

const AdminScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, isSuperAdmin, bootstrapped, logout } = useAuth();
  const { palette: adminPalette } = useAdminTheme();
  const isDark = theme.mode === 'dark';
  const insets = useSafeAreaInsets();
  const { confirm, error: showError, success: showSuccess } = useFeedback();
  const layout = useWindowDimensions();
  const [tabIndex, setTabIndex] = useState(0);
  const activeTab = ADMIN_TAB_ROUTES[tabIndex]?.key ?? 'overview';
  const setActiveTab = useCallback((tab) => {
    const i = ADMIN_TAB_ROUTES.findIndex((r) => r.key === tab);
    if (i >= 0) setTabIndex(i);
    setSearchQuery('');
  }, []);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [apiArticles, setApiArticles] = useState([]);
  const [serverAnalytics, setServerAnalytics] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [activePipelineAction, setActivePipelineAction] = useState(null);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineRunPhase, setPipelineRunPhase] = useState('idle');
  const [pipelineRunLabel, setPipelineRunLabel] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState(null);
  const [articlePipelineFilter, setArticlePipelineFilter] = useState('');
  const [articleCounts, setArticleCounts] = useState(null);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const [connectionUrlInput, setConnectionUrlInput] = useState('');
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const hasSnapshotRef = useRef(false);
  const analyticsSigRef = useRef('');
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [connections, setConnections] = useState([]);
  const connectionsRef = useRef([]);
  const hasBootstrappedRef = useRef(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [connectionInput, setConnectionInput] = useState('');
  const [subInputs, setSubInputs] = useState({});
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [listPanel, setListPanel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [reviewArticle, setReviewArticle] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const adminSocketRef = useRef(null);
  const adminReconnectRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const connect = async () => {
      const ws = await openAdminNotificationsSocket((payload) => {
        if (payload?.type !== 'notification.created' || !payload.notification?.id) return;
        const n = payload.notification;
        setNotifications((prev) => {
          if (prev.some((row) => String(row.id) === String(n.id))) return prev;
          return [
            {
              id: n.id,
              type: n.type || 'alert',
              title: n.type || 'alert',
              source: (n.type || 'alert').replace(/_/g, ' '),
              message: n.text || n.details || '',
              details: n.details || '',
              status: 'unread',
              read: false,
              important: !!n.important,
              meta: n.meta || {},
              time: n.created_at
                ? String(n.created_at).slice(0, 16).replace('T', ' ')
                : '',
              created_at: n.created_at,
            },
            ...prev,
          ];
        });
        if (n.type === 'admin_user_feedback' || n.type === 'admin_user_report') {
          showSuccess(n.text || 'New user feedback');
          dispatchAdminFeedbackRefresh({ notification: n });
        }
      });
      if (!ws) return;
      adminSocketRef.current = ws;
      ws.onclose = () => {
        adminReconnectRef.current = setTimeout(connect, 2500);
      };
    };
    connect();
    return () => {
      if (adminSocketRef.current) adminSocketRef.current.close();
      if (adminReconnectRef.current) clearTimeout(adminReconnectRef.current);
    };
  }, [isAdmin, showSuccess]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (!user) {
      navigation.reset({ index: 0, routes: [{ name: 'OpeningScreen' }] });
      return;
    }
    if (!isAdmin) {
      Alert.alert('Access denied', 'Only administrators can open the admin panel.');
      navigation.reset({ index: 0, routes: [{ name: 'NewsFeed' }] });
    }
  }, [bootstrapped, user, isAdmin, navigation]);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  const updateConnectionsIfChanged = useCallback((next) => {
    const normalized = normAdminConnections(next || []);
    setConnections((prev) => {
      if (
        prev.length === normalized.length &&
        prev.every((row, i) => row.slug === normalized[i]?.slug && row.url === normalized[i]?.url)
      ) {
        return prev;
      }
      return normalized;
    });
  }, []);

  useEffect(() => {
    hasSnapshotRef.current = Boolean(serverAnalytics);
  }, [serverAnalytics]);

  const loadOverview = useCallback(async ({ manual = false, silent = false } = {}) => {
    const isInitial = !hasSnapshotRef.current;
    try {
      if (!silent) setRefreshing(true);
      if (isInitial) setOverviewLoading(true);
      setAnalyticsError(null);
      const data = await loadAdminOverview({
        cacheBust: manual || !silent,
        requireAnalytics: manual,
        includeArticles: manual && !silent,
        articlePageSize: 50,
      });
      const mapped = (data.articles || []).map(mapAdminArticleRow);
      const enriched = enrichAnalyticsSnapshot(data.serverAnalytics, mapped, {
        users: data.users,
        connections: data.connections?.length ? data.connections : connectionsRef.current,
      });
      const hasKpis =
        isAnalyticsPayload(data.serverAnalytics) ||
        mapped.length > 0 ||
        (data.users?.length ?? 0) > 0 ||
        (data.connections?.length ?? connectionsRef.current.length) > 0;
      if (hasKpis) {
        const nextPayload = { ...enriched, _refreshedAt: Date.now() };
        const sig = analyticsSnapshotSignature(nextPayload);
        if (sig !== analyticsSigRef.current) {
          analyticsSigRef.current = sig;
          setServerAnalytics(nextPayload);
          setLiveUpdatedAt(new Date());
        }
        setAnalyticsError(
          data.serverAnalytics ? null : data.analyticsError || 'Using article and settings counts (analytics API unavailable).'
        );
      } else {
        setAnalyticsError(data.analyticsError || 'Could not load dashboard data from the server.');
        if (manual || !silent) setServerAnalytics(null);
      }
      if (data.modelMetrics) setModelMetrics(data.modelMetrics);
      if (data.connections?.length) updateConnectionsIfChanged(data.connections);
    } catch (e) {
      setAnalyticsError(e?.message || 'Failed to load analytics.');
      if (manual || !silent) setServerAnalytics(null);
    } finally {
      if (!silent) setRefreshing(false);
      setOverviewLoading(false);
    }
  }, [updateConnectionsIfChanged]);

  const loadArticles = useCallback(async ({ silent = false } = {}) => {
    const { scope, pipelineStatus, moderationStatus } = getArticlesFetchParams(articlePipelineFilter);
    if (!silent) setArticlesLoading(true);
    try {
      const res = await getAdminArticles({
        page: 1,
        pageSize: 100,
        scope,
        pipelineStatus,
        moderationStatus,
      });
      setApiArticles((res.results || []).map(mapAdminArticleRow));
      setArticleCounts(res.counts || null);
    } catch (e) {
      if (!silent) {
        Alert.alert('Articles', e?.message || 'Could not load articles.');
        setApiArticles([]);
        setArticleCounts(null);
      }
    } finally {
      if (!silent) setArticlesLoading(false);
    }
  }, [articlePipelineFilter]);

  const loadLists = useCallback(async () => {
    setListsLoading(true);
    try {
      const listQ = activeTab === 'users' || activeTab === 'admins' ? searchQuery.trim() : '';
      const [usersRes, adminsRes, notificationsRes, settingsRes] = await Promise.all([
        getAdminUsers({ q: activeTab === 'users' ? listQ : '', role: 'user' }),
        getAdminUsers({ q: activeTab === 'admins' ? listQ : '', role: 'admin' }),
        getAdminNotifications(),
        getAdminSettings(),
      ]);
      const usersData = (usersRes.results || []).map((u) => ({
        id: u.id,
        name: u.email?.split('@')[0] || 'user',
        email: u.email,
        status: u.is_active ? 'active' : 'inactive',
        role: u.role,
        isAdmin: false,
      }));
      const adminsData = (adminsRes.results || []).map((u) => ({
        id: u.id,
        name: u.email?.split('@')[0] || 'admin',
        email: u.email,
        status: u.is_active ? 'active' : 'inactive',
        role: u.role,
        is_super_admin: u.is_super_admin,
      }));
      const notificationsData = (notificationsRes.results || []).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.type,
        source: n.type?.replace(/_/g, ' ') || 'Alert',
        message: n.text,
        details: n.details || '',
        status: n.read ? 'read' : 'unread',
        read: !!n.read,
        important: !!n.important,
        meta: n.meta || {},
        time: n.created_at
          ? (typeof n.created_at === 'string'
            ? n.created_at.slice(0, 16).replace('T', ' ')
            : new Date(n.created_at).toLocaleString())
          : '',
        created_at: n.created_at,
      }));
      const settingsData = {
        notifications: !!settingsRes.notifications_enabled_default,
        pushNotification: !!settingsRes.notifications_enabled_default,
        emailNotification: !!settingsRes.notifications_enabled_default,
        inAppNotification: !!settingsRes.notifications_enabled_default,
        connections: !!settingsRes.allow_external_connections,
        moderationMode: settingsRes.moderation_mode || 'review',
        language: settingsRes.language || 'English',
        timezone: settingsRes.timezone || 'UTC',
      };
      const categoriesData = normAdminCategories(settingsRes.categories || []);
      const connectionsData = normAdminConnections(settingsRes.connections || []);
      setUsers(usersData);
      setAdmins(adminsData);
      setNotifications(notificationsData);
      setSettings(settingsData);
      setCategories(categoriesData);
      updateConnectionsIfChanged(connectionsData);
    } catch (e) {
      showError(e?.message || 'Could not load admin lists.');
    } finally {
      setListsLoading(false);
    }
  }, [activeTab, searchQuery, showError, updateConnectionsIfChanged]);

  const loadData = useCallback(async () => {
    await loadOverview({ silent: true });
    await loadLists();
  }, [loadOverview, loadLists]);

  const handleCreateAdmin = async (email, password) => {
    await postAdminCreate(email, password);
    await loadData();
  };

  useEffect(() => {
    if (!bootstrapped || !isAdmin || hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;
    loadData();
  }, [bootstrapped, isAdmin, loadData]);

  useEffect(() => {
    if (!bootstrapped || !isAdmin || activeTab !== 'articles') return;
    loadArticles();
  }, [activeTab, articlePipelineFilter, bootstrapped, isAdmin, loadArticles]);

  useEffect(() => {
    if (!bootstrapped || !isAdmin || activeTab !== 'articles') return undefined;
    const poll = () => {
      if (AppState.currentState === 'active') loadArticles({ silent: true });
    };
    const id = setInterval(poll, ARTICLES_POLL_INTERVAL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadArticles({ silent: true });
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [activeTab, bootstrapped, isAdmin, loadArticles]);

  useEffect(() => {
    if (!bootstrapped || !isAdmin || (activeTab !== 'users' && activeTab !== 'admins')) return;
    const id = setTimeout(() => loadLists(), 350);
    return () => clearTimeout(id);
  }, [searchQuery, activeTab, bootstrapped, isAdmin, loadLists]);

  useEffect(() => {
    if (!bootstrapped || !isAdmin || activeTab !== 'overview') return;
    loadOverview({ silent: true });
  }, [bootstrapped, isAdmin, activeTab, loadOverview]);

  useEffect(() => {
    if (!bootstrapped || !isAdmin || activeTab !== 'overview') return undefined;
    const poll = () => {
      if (AppState.currentState === 'active') loadOverview({ silent: true });
    };
    const id = setInterval(poll, DASHBOARD_POLL_INTERVAL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadOverview({ silent: true });
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [activeTab, bootstrapped, isAdmin, loadOverview]);

  const resetPipelineRunUi = () => {
    setPipelineRunPhase('idle');
    setPipelineProgress(0);
    setPipelineRunLabel('');
  };

  useEffect(() => {
    if (pipelineRunPhase !== 'running' || !serverAnalytics?.pipeline_summary) return;
    const queued = serverAnalytics.pipeline_summary.queued ?? 0;
    setPipelineRunLabel(`Processing queue · ${queued} in queue…`);
  }, [serverAnalytics, pipelineRunPhase]);

  const runAdminAction = async ({ actionId, runner, startLabel, successLabel }) => {
    if (activePipelineAction) return;
    setActivePipelineAction(actionId);
    setPipelineRunPhase('running');
    setPipelineProgress(4);
    setPipelineRunLabel(startLabel);
    const maxSimulated = 90;
    let tick;
    let poll;
    try {
      tick = setInterval(() => {
        setPipelineProgress((prev) => {
          if (prev >= maxSimulated) return prev;
          return Math.min(maxSimulated, prev + Math.max(2, (maxSimulated - prev) * 0.12));
        });
      }, 280);
      poll = setInterval(() => {
        loadOverview({ silent: true });
      }, 10_000);
      const result = await runner();
      const ok = result?.processed_ok ?? result?.delta?.processed_total ?? 0;
      const err = result?.errors ?? 0;
      setPipelineProgress(100);
      setPipelineRunPhase('success');
      setPipelineRunLabel(successLabel(ok, err, result));
      await loadOverview({ silent: true });
      await loadArticles();
      setTimeout(resetPipelineRunUi, 2200);
    } catch (e) {
      setPipelineProgress(100);
      setPipelineRunPhase('error');
      setPipelineRunLabel(e?.message || 'Run failed');
      setTimeout(resetPipelineRunUi, 2800);
    } finally {
      if (tick) clearInterval(tick);
      if (poll) clearInterval(poll);
      setActivePipelineAction(null);
    }
  };

  const runPipeline = async () =>
    runAdminAction({
      actionId: 'batch',
      runner: () => postAdminPipelineRun(PIPELINE_BATCH_SIZE, { drainQueue: true }),
      startLabel: 'Processing queue until empty…',
      successLabel: (ok, err, result) => {
        const left = result?.pending_remaining ?? result?.after?.raw_pending;
        return `Done · ${ok} processed${err ? ` · ${err} errors` : ''}${left === 0 ? ' · queue empty' : left != null ? ` · ${left} still in queue` : ''}`;
      },
    });

  const runScrapeOnly = async () =>
    runAdminAction({
      actionId: 'scrape',
      runner: () => postAdminScrapeRun(SCRAPE_ONLY_LIMIT),
      startLabel: `Scraping up to ${SCRAPE_ONLY_LIMIT} new articles…`,
      successLabel: (_ok, _err, result) => `Done · ${result?.delta?.raw_total ?? 0} raw added`,
    });

  const runScrapeAndPipeline = async () =>
    runAdminAction({
      actionId: 'scrape_pipeline',
      runner: () => postAdminScrapeAndPipelineRun(SCRAPE_AND_PIPELINE),
      startLabel: 'Scraping then running pipeline…',
      successLabel: (ok, err, result) => {
        const processed = result?.pipeline?.processed_ok ?? ok;
        const errs = result?.pipeline?.errors ?? err;
        const left = result?.pipeline?.pending_remaining ?? result?.after?.raw_pending;
        return `Done · ${result?.delta?.raw_total ?? 0} scraped · ${processed} processed${errs ? ` · ${errs} errors` : ''}${left === 0 ? ' · queue empty' : left != null ? ` · ${left} still in queue` : ''}`;
      },
    });

  const handleKpiPress = (key) => {
    const nav = KPI_TAB_NAV[key];
    if (!nav) return;
    setActiveTab(nav.tab);
    setSearchQuery('');
    if (nav.tab === 'articles') {
      setArticlePipelineFilter(nav.pipeline || '');
    }
  };

  const handleArticlePipelineFilterChange = (filter) => {
    setArticlePipelineFilter(filter);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'OpeningScreen' }] });
    } catch {
      Alert.alert('Logout', 'Could not logout. Please try again.');
    }
  };

  const chartData = useMemo(
    () =>
      enrichAnalyticsSnapshot(serverAnalytics, apiArticles, {
        users,
        connections,
      }),
    [serverAnalytics, apiArticles, users, connections]
  );
  const hasAnalytics =
    isAnalyticsPayload(serverAnalytics) &&
    (Number(chartData.raw_total) > 0 ||
      Number(chartData.processed_total) > 0 ||
      apiArticles.length > 0);
  const statCards = useMemo(
    () => buildDashboardStatCards(chartData, adminPalette),
    [chartData, adminPalette]
  );
  const unreadAlertsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );
  const liveUpdatedLabel = liveUpdatedAt
    ? liveUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : serverAnalytics?.generated_at
      ? String(serverAnalytics.generated_at).slice(0, 16).replace('T', ' ')
      : '';

  const handleEdit = (item) => {
    if (item?.fromApi) {
      Alert.alert('Article', `${item.title}\nScope: ${item.scope}\nStatus: ${item.status}`);
      return;
    }
    setEditingItem(item);
    setFormData(item);
    setModalVisible(true);
  };

  const handleDelete = async (idOrArticle, type) => {
    if (type === 'article') {
      const row = typeof idOrArticle === 'object' ? idOrArticle : apiArticles.find((a) => String(a.id) === String(idOrArticle));
      if (!row) return;
      const accepted = await confirm({
        title: 'Delete article?',
        message: 'Remove this article from the database?',
        confirmText: 'Delete',
        danger: true,
      });
      if (!accepted) return;
      try {
        await deleteAdminArticle(row.scope, row.id);
        await loadArticles();
      } catch (e) {
        showError(e?.message || 'Delete failed');
      }
      return;
    }
    const id = typeof idOrArticle === 'object' ? idOrArticle.id : idOrArticle;
    const accepted = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      danger: true,
    });
    if (!accepted) return;
    if (type === 'user' || type === 'admin') await deleteAdminUser(id);
    loadData();
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'users') {
        if (editingItem) await patchAdminUser(editingItem.id, { is_active: formData.status === 'active' });
        else throw new Error('User creation is restricted to auth registration.');
      } else if (activeTab === 'articles') {
        throw new Error('Create or edit articles from the articles list only.');
      }
      loadData();
      setModalVisible(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      showError('Failed to save');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const applySettingsFromApi = (updated) => {
    setSettings({
      notifications: !!updated.notifications_enabled_default,
      pushNotification: !!updated.notifications_enabled_default,
      emailNotification: !!updated.notifications_enabled_default,
      inAppNotification: !!updated.notifications_enabled_default,
      connections: !!updated.allow_external_connections,
      moderationMode: updated.moderation_mode || 'review',
      language: updated.language || 'English',
      timezone: updated.timezone || 'UTC',
    });
  };

  const reloadSettings = useCallback(async () => {
    try {
      const settingsRes = await getAdminSettings();
      applySettingsFromApi(settingsRes);
      const cats = normAdminCategories(settingsRes.categories || []);
      setCategories(cats);
      updateConnectionsIfChanged(settingsRes.connections || []);
      setSelectedCategorySlug((prev) => (prev && cats.some((c) => c.slug === prev) ? prev : ''));
      return cats;
    } catch (e) {
      showError(e?.message || 'Could not load settings from server.');
      return [];
    }
  }, [showError, updateConnectionsIfChanged]);

  useEffect(() => {
    if (!bootstrapped || !isAdmin || activeTab !== 'settings') return;
    reloadSettings();
  }, [bootstrapped, isAdmin, activeTab, reloadSettings]);

  const handleSettingsChange = async (updates) => {
    const pushOn =
      updates.pushNotification !== undefined
        ? updates.pushNotification
        : updates.emailNotification !== undefined
          ? updates.emailNotification
          : updates.inAppNotification !== undefined
            ? updates.inAppNotification
            : settings.pushNotification;
    try {
      const payload = {
        notifications_enabled_default: pushOn !== undefined ? !!pushOn : !!settings.pushNotification,
        language: updates.language || settings.language || 'English',
        timezone: updates.timezone || settings.timezone || 'UTC',
      };
      const updated = await patchAdminSettings(payload);
      applySettingsFromApi(updated);
      if (updates.language) showSuccess(`Language set to ${updates.language}`);
      else if (updates.timezone) showSuccess(`Timezone set to ${updates.timezone}`);
    } catch (e) {
      showError(e?.message || 'Failed to update settings.');
    }
  };

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === selectedCategorySlug) || null,
    [categories, selectedCategorySlug]
  );

  const toggleListPanel = (panel) => {
    setListPanel((prev) => (prev === panel ? null : panel));
  };

  const handleAddCategory = async () => {
    const name = categoryInput.trim();
    if (!name) return;
    try {
      await createAdminCategory(name, []);
      setCategoryInput('');
      const cats = await reloadSettings();
      const added = cats.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (added) setSelectedCategorySlug(added.slug);
      showSuccess('Category saved to database.');
    } catch (e) {
      showError(e?.message || 'Could not add category');
    }
  };

  const handleRemoveCategory = async (slug) => {
    try {
      await deleteAdminCategory(slug);
      await reloadSettings();
      setSelectedCategorySlug((prev) => (prev === slug ? '' : prev));
    } catch (e) {
      showError(e?.message || 'Could not remove category');
    }
  };

  const handleAddSubcategory = async (categorySlug) => {
    const name = String(subInputs[categorySlug] || '').trim();
    if (!name) return;
    try {
      await addAdminSubcategory(categorySlug, name);
      setSubInputs((prev) => ({ ...prev, [categorySlug]: '' }));
      await reloadSettings();
      showSuccess('Subcategory added.');
    } catch (e) {
      showError(e?.message || 'Could not add subcategory');
    }
  };

  const handleRemoveSubcategory = async (categorySlug, subSlug) => {
    try {
      await deleteAdminSubcategory(categorySlug, subSlug);
      await reloadSettings();
    } catch (e) {
      showError(e?.message || 'Could not remove subcategory');
    }
  };

  const handleAddConnection = async () => {
    const name = connectionInput.trim();
    const url = connectionUrlInput.trim();
    if (!name) return;
    if (!url) {
      showError('URL is required (RSS feed or site feed URL).');
      return;
    }
    try {
      await createAdminConnection(name, url);
      setConnectionInput('');
      setConnectionUrlInput('');
      await reloadSettings();
      await loadOverview({ silent: true });
      showSuccess('Connection saved to database.');
    } catch (e) {
      showError(e?.message || 'Could not add connection');
    }
  };

  const handleRemoveConnection = async (slug) => {
    try {
      await deleteAdminConnection(slug);
      await reloadSettings();
      await loadOverview({ silent: true });
    } catch (e) {
      showError(e?.message || 'Could not remove connection');
    }
  };

  const handleDeleteAllCategories = async () => {
    try {
      await patchAdminSettings({ categories: [] });
      await reloadSettings();
      setListPanel(null);
      setSelectedCategorySlug('');
    } catch (e) {
      showError(e?.message || 'Could not delete categories');
    }
  };

  const handleDeleteAllConnections = async () => {
    try {
      await patchAdminSettings({ connections: [] });
      await reloadSettings();
      await loadOverview({ silent: true });
      setListPanel(null);
    } catch (e) {
      showError(e?.message || 'Could not delete connections');
    }
  };

  const filteredArticles = useMemo(
    () => filterArticlesForDisplay(apiArticles, articlePipelineFilter, searchQuery),
    [apiArticles, articlePipelineFilter, searchQuery]
  );

  const renderAdminScene = ({ route }) => {
    const scroll = (content) => (
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    );

    switch (route.key) {
      case 'overview':
        return scroll(
          <>
            <DashboardTab
              palette={adminPalette}
              chartData={chartData}
              hasAnalytics={hasAnalytics}
              statCards={statCards}
              analyticsError={analyticsError}
              overviewLoading={overviewLoading}
              isOverviewActive={activeTab === 'overview'}
              onKpiPress={handleKpiPress}
              onManageSettings={() => setActiveTab('settings')}
              refreshing={refreshing}
              onRunPipeline={runPipeline}
              onRunScrape={runScrapeOnly}
              onRunScrapeAndPipeline={runScrapeAndPipeline}
              activePipelineAction={activePipelineAction}
              pipelineProgress={pipelineProgress}
              pipelineRunPhase={pipelineRunPhase}
              pipelineRunLabel={pipelineRunLabel}
              liveUpdatedLabel={liveUpdatedLabel}
            />
            <AnalyticsTab serverAnalytics={hasAnalytics ? chartData : null} modelMetrics={modelMetrics} />
          </>
        );
      case 'users':
        return scroll(
          <UsersTab
            users={users}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'user')}
            loading={listsLoading}
          />
        );
      case 'admins':
        return scroll(
          <AdminsTab
            admins={admins}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDelete={(id) => handleDelete(id, 'admin')}
            onCreate={isSuperAdmin ? handleCreateAdmin : null}
            loading={listsLoading}
          />
        );
      case 'articles':
        return (
          <ArticlesTab
            articles={filteredArticles}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onReviewArticle={setReviewArticle}
            onViewArticle={(article) =>
              navigation.navigate('ArticleDetail', buildArticleDetailParams(article))
            }
            onDelete={(article) => handleDelete(article, 'article')}
            pipelineFilter={articlePipelineFilter}
            onPipelineFilterChange={handleArticlePipelineFilterChange}
            loading={articlesLoading}
            articleCounts={articleCounts}
            palette={adminPalette}
          />
        );
      case 'feedback':
        return scroll(<FeedbackTab navigation={navigation} isActive={activeTab === 'feedback'} />);
      case 'notifications':
        return scroll(
          <NotificationsTab
            notifications={notifications}
            onSwitchTab={setActiveTab}
            loading={listsLoading}
            onNotificationRead={(id) => {
              setNotifications((prev) =>
                prev.map((n) => (String(n.id) === String(id) ? { ...n, read: true, status: 'read' } : n))
              );
            }}
          />
        );
      case 'settings':
        return scroll(
          <SettingsTab
            settings={settings}
            onSettingsChange={handleSettingsChange}
            categories={categories}
            connections={connections}
            categoryInput={categoryInput}
            setCategoryInput={setCategoryInput}
            connectionInput={connectionInput}
            setConnectionInput={setConnectionInput}
            connectionUrlInput={connectionUrlInput}
            setConnectionUrlInput={setConnectionUrlInput}
            subInputs={subInputs}
            setSubInputs={setSubInputs}
            selectedCategorySlug={selectedCategorySlug}
            onSelectedCategorySlugChange={setSelectedCategorySlug}
            selectedCategory={selectedCategory}
            listPanel={listPanel}
            onToggleListPanel={toggleListPanel}
            onCloseListPanel={() => setListPanel(null)}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onAddSubcategory={handleAddSubcategory}
            onRemoveSubcategory={handleRemoveSubcategory}
            onAddConnection={handleAddConnection}
            onRemoveConnection={handleRemoveConnection}
            onDeleteAllCategories={handleDeleteAllCategories}
            onDeleteAllConnections={handleDeleteAllConnections}
            onLogout={handleLogout}
            onViewNewsApp={() => navigation.navigate('NewsFeedPreview')}
            onViewPicsApp={() => navigation.navigate('PicsPreview')}
            darkTheme={theme.mode === 'dark'}
            onToggleTheme={toggleTheme}
          />
        );
      default:
        return null;
    }
  };

  const userFields = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
    { name: 'email', label: 'Email', type: 'text', placeholder: 'Enter email', keyboardType: 'email-address' },
    { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
  ];

  const articleFields = [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter title' },
    { name: 'author', label: 'Author', type: 'text', placeholder: 'Enter author' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'Enter category' },
    { name: 'status', label: 'Status', type: 'select', options: ['published', 'pending'] },
  ];

  if (!bootstrapped || !isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: adminPalette.page }]} edges={[]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={adminPalette.page}
      />

      <Header activeTab={activeTab} />
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadAlerts={unreadAlertsCount}
      />

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TabView
          navigationState={{ index: tabIndex, routes: ADMIN_TAB_ROUTES }}
          renderScene={renderAdminScene}
          onIndexChange={(i) => {
            setTabIndex(i);
            setSearchQuery('');
          }}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
          swipeEnabled={false}
          animationEnabled={false}
          lazy
          lazyPreloadDistance={0}
          removeClippedSubviews
          style={{ flex: 1 }}
          sceneContainerStyle={{ flex: 1 }}
        />
      </Animated.View>

      <EditModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingItem(null);
          setFormData({});
        }}
        title={`${editingItem ? 'Edit' : 'Add'} ${activeTab === 'users' ? 'User' : 'Article'}`}
        formData={formData}
        onFormChange={handleFormChange}
        fields={activeTab === 'users' ? userFields : articleFields}
        onSave={handleSave}
      />

      <AdminArticleReviewModal
        visible={Boolean(reviewArticle)}
        article={reviewArticle}
        onClose={() => setReviewArticle(null)}
        onSaved={(updated) => {
          setApiArticles((prev) =>
            prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row))
          );
        }}
        onOpenInApp={(article) => {
          setReviewArticle(null);
          navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
        }}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -100,
    right: -100,
  },
  accentCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: 200,
    left: -80,
  },
  accentCircle3: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: SCREEN_HEIGHT * 0.4,
    right: -50,
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 100,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default AdminScreen; 
