import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Animated, Dimensions, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  deleteAdminUser,
  getAdminAnalytics,
  getAdminArticles,
  getAdminModelMetrics,
  getAdminNotifications,
  getAdminSettings,
  getAdminUsers,
  patchAdminSettings,
  patchAdminUser,
  postAdminCreate,
  postAdminPipelineRun,
} from '../../api/adminApi';
import MockAPI from './Service/MockAPI';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import DashboardTab from './screens/DashboardTab';
import AnalyticsTab from './screens/AnalyticsTab';
import UsersTab from './screens/UsersTab';
import AdminsTab from './screens/AdminsTab';
import ArticlesTab from './screens/ArticlesTab';
import NotificationsTab from './screens/NotificationsTab';
import SettingsTab from './screens/SettingsTab';
import EditModal from './components/EditModal';
import ListModal from './components/ListModal';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import { normAdminList, toAdminPayloadList } from '../../utils/adminLists';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function mapAdminArticleRow(doc) {
  const dateStr = doc.fetched_at || doc.processed_at || '';
  const shortDate =
    typeof dateStr === 'string' ? dateStr.slice(0, 16).replace('T', ' ') : String(dateStr || '');
  const status =
    doc.scope === 'raw'
      ? String(doc.pipeline_status ?? 'pending')
      : String(doc.credibility_label ?? '—');
  const published = doc.scope === 'processed' && doc.credibility_label != null && doc.credibility_label !== '';
  return {
    id: doc.id,
    title: doc.title || '(no title)',
    author: doc.source_key || (doc.canonical_url ? String(doc.canonical_url).slice(0, 48) : '—'),
    category: doc.scope === 'raw' ? 'Raw' : 'Processed',
    status: published ? 'published' : status,
    date: shortDate || '—',
    fromApi: true,
  };
}

const AdminScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, isAdmin, isSuperAdmin, bootstrapped, logout } = useAuth();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { confirm, error: showError } = useFeedback();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [apiArticles, setApiArticles] = useState([]);
  const [serverAnalytics, setServerAnalytics] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [connections, setConnections] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [connectionInput, setConnectionInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [listModalType, setListModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(circle1Anim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(circle2Anim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(circle3Anim, {
        toValue: 1,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    if (!bootstrapped || !isAdmin) return;
    loadData();
  }, [bootstrapped, isAdmin]);

  useEffect(() => {
    if (!bootstrapped || !isAdmin || (activeTab !== 'users' && activeTab !== 'admins')) return;
    const id = setTimeout(() => {
      loadData();
    }, 350);
    return () => clearTimeout(id);
  }, [searchQuery, activeTab, bootstrapped, isAdmin]);

  const loadData = async () => {
    let svr = null;
    let arts = [];
    try {
      svr = await getAdminAnalytics();
    } catch (e) {
      Alert.alert('Admin API', e?.message || 'Could not load analytics.');
    }
    try {
      const res = await getAdminArticles({ page: 1, pageSize: 50, scope: 'all' });
      arts = (res.results || []).map(mapAdminArticleRow);
    } catch (e) {
      Alert.alert('Admin API', e?.message || 'Could not load articles.');
    }
    try {
      const mm = await getAdminModelMetrics();
      setModelMetrics(mm);
    } catch {
      setModelMetrics(null);
    }
    setServerAnalytics(svr);
    setApiArticles(arts);

    const listQ = activeTab === 'users' || activeTab === 'admins' ? searchQuery.trim() : '';
    const [usersRes, adminsRes, keywordsData, notificationsRes, settingsRes, analyticsData] = await Promise.all([
      getAdminUsers({ q: activeTab === 'users' ? listQ : '', role: 'user' }),
      getAdminUsers({ q: activeTab === 'admins' ? listQ : '', role: 'admin' }),
      MockAPI.getKeywords(),
      getAdminNotifications(),
      getAdminSettings(),
      MockAPI.getAnalytics(),
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
      title: n.type,
      message: n.text,
      status: n.read ? 'read' : 'unread',
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
    const categoriesData = normAdminList(settingsRes.categories || []);
    const connectionsData = normAdminList(settingsRes.connections || []);
    setUsers(usersData);
    setAdmins(adminsData);
    setKeywords(keywordsData);
    setNotifications(notificationsData);
    setSettings(settingsData);
    setCategories(categoriesData);
    setConnections(connectionsData);
    setAnalytics(analyticsData);
  };

  const handleCreateAdmin = async (email, password) => {
    await postAdminCreate(email, password);
    await loadData();
  };

  const runPipeline = async () => {
    setPipelineRunning(true);
    try {
      const result = await postAdminPipelineRun(15);
      Alert.alert('Pipeline', JSON.stringify(result).slice(0, 800));
      await loadData();
    } catch (e) {
      Alert.alert('Pipeline', e?.message || 'Run failed.');
    } finally {
      setPipelineRunning(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'OpeningScreen' }] });
    } catch {
      Alert.alert('Logout', 'Could not logout. Please try again.');
    }
  };

  const stats = serverAnalytics
    ? [
        { label: 'Raw articles', value: String(serverAnalytics.raw_total ?? 0) },
        { label: 'Processed', value: String(serverAnalytics.processed_total ?? 0) },
        { label: 'In feed list', value: String(apiArticles.length) },
        {
          label: 'Pipeline states',
          value: String(Object.keys(serverAnalytics.raw_by_pipeline_status || {}).length),
        },
      ]
    : [
        { label: 'Total Users', value: users.length.toString() },
        { label: 'Active Users', value: users.filter(u => u.status === 'active').length.toString() },
        { label: 'Keywords (mock)', value: keywords.length.toString() },
        { label: 'Articles (mock)', value: '—' },
      ];

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleEdit = (item) => {
    if (item?.fromApi) {
      Alert.alert('Read-only', 'This article is loaded from the API; editing is not available in the app yet.');
      return;
    }
    setEditingItem(item);
    setFormData(item);
    setModalVisible(true);
  };

  const handleDelete = async (id, type) => {
    if (type === 'article') {
      const row = apiArticles.find(a => String(a.id) === String(id));
      if (row?.fromApi) {
        Alert.alert('Read-only', 'Articles come from the database; delete is not exposed here yet.');
        return;
      }
    }
    const accepted = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      danger: true,
    });
    if (!accepted) return;
    if (type === 'user' || type === 'admin') await deleteAdminUser(id);
    else if (type === 'article') await MockAPI.deleteArticle(id);
    loadData();
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'users') {
        if (editingItem) await patchAdminUser(editingItem.id, { is_active: formData.status === 'active' });
        else throw new Error('User creation is restricted to auth registration.');
      } else if (activeTab === 'articles') {
        if (editingItem) await MockAPI.updateArticle(editingItem.id, formData);
        else await MockAPI.createArticle(formData);
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

  const handleSettingsChange = async (updates) => {
    const pushOn =
      updates.pushNotification !== undefined
        ? updates.pushNotification
        : updates.emailNotification !== undefined
          ? updates.emailNotification
          : updates.inAppNotification !== undefined
            ? updates.inAppNotification
            : settings.pushNotification;
    const payload = {
      notifications_enabled_default: pushOn !== undefined ? !!pushOn : !!settings.notifications,
      allow_external_connections:
        updates.connections !== undefined ? !!updates.connections : !!settings.connections,
      moderation_mode: updates.moderationMode || settings.moderationMode || 'review',
      categories: toAdminPayloadList(categories),
      connections: toAdminPayloadList(connections),
      language: updates.language || settings.language || 'English',
      timezone: updates.timezone || settings.timezone || 'UTC',
    };
    const updated = await patchAdminSettings(payload);
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

  const handleAddCategory = async () => {
    const name = categoryInput.trim();
    if (!name) return;
    const next = [...toAdminPayloadList(categories), name];
    await patchAdminSettings({ categories: next });
    setCategoryInput('');
    loadData();
  };

  const handleRemoveCategory = async (id) => {
    const next = toAdminPayloadList(categories).filter((c) => c !== id);
    await patchAdminSettings({ categories: next });
    loadData();
  };

  const handleAddConnection = async () => {
    const name = connectionInput.trim();
    if (!name) return;
    const next = [...toAdminPayloadList(connections), name];
    await patchAdminSettings({ connections: next });
    setConnectionInput('');
    loadData();
  };

  const handleRemoveConnection = async (id) => {
    const next = toAdminPayloadList(connections).filter((c) => c !== id);
    await patchAdminSettings({ connections: next });
    loadData();
  };

  const openListModal = (type) => {
    setListModalType(type);
    setListModalVisible(true);
  };

  const handleDeleteAllCategories = async () => {
    for (let cat of categories) await MockAPI.removeCategory(cat.id);
    loadData();
  };

  const handleDeleteAllConnections = async () => {
    for (let conn of connections) await MockAPI.removeConnection(conn.id);
    loadData();
  };

  const filteredArticles = apiArticles.filter(
    a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(a.status).toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Gradient background */}
      <LinearGradient
        colors={theme.mode === 'dark' 
          ? ['#0F172A', '#1E293B', '#334155', '#1E293B', '#0F172A']
          : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Animated decorative circles */}
      <Animated.View 
        style={[
          styles.accentCircle1, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.12' : '0.05'})`,
            opacity: circle1Anim,
            transform: [
              {
                scale: circle1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle2, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.10' : '0.04'})`,
            opacity: circle2Anim,
            transform: [
              {
                scale: circle2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle3, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.08' : '0.03'})`,
            opacity: circle3Anim,
            transform: [
              {
                scale: circle3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />

      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <Animated.ScrollView
        style={[styles.mainScroll, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {(activeTab === 'overview' || activeTab === 'dashboard' || activeTab === 'analytics') && (
          <>
            <DashboardTab
              stats={stats}
              keywords={keywords}
              onRunPipeline={runPipeline}
              pipelineRunning={pipelineRunning}
            />
            <AnalyticsTab analytics={analytics} serverAnalytics={serverAnalytics} modelMetrics={modelMetrics} />
          </>
        )}
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'user')}
          />
        )}
        {activeTab === 'admins' && (
          <AdminsTab
            admins={admins}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDelete={(id) => handleDelete(id, 'admin')}
            onCreate={isSuperAdmin ? handleCreateAdmin : null}
          />
        )}
        {activeTab === 'articles' && (
          <ArticlesTab
            articles={filteredArticles}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'article')}
            articleReadOnly={(a) => !!a?.fromApi}
          />
        )}
        {activeTab === 'notifications' && <NotificationsTab notifications={notifications} />}
        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onSettingsChange={handleSettingsChange}
            categories={categories}
            connections={connections}
            categoryInput={categoryInput}
            setCategoryInput={setCategoryInput}
            connectionInput={connectionInput}
            setConnectionInput={setConnectionInput}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onAddConnection={handleAddConnection}
            onRemoveConnection={handleRemoveConnection}
            onOpenListModal={openListModal}
            onLogout={handleLogout}
          />
        )}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

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

      <ListModal
        visible={listModalVisible}
        onClose={() => setListModalVisible(false)}
        title="List"
        items={listModalType === 'category' ? categories : connections}
        onDeleteItem={
          listModalType === 'category' ? handleRemoveCategory : handleRemoveConnection
        }
        onDeleteAll={
          listModalType === 'category' ? handleDeleteAllCategories : handleDeleteAllConnections
        }
        itemType={listModalType}
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