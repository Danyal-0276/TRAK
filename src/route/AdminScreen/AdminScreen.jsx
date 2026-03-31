import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Alert, StyleSheet, StatusBar, Animated, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminAnalytics,
  getAdminArticles,
  getAdminModelMetrics,
  postAdminPipelineRun,
} from '../../api/adminApi';
import MockAPI from './Service/MockAPI';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import DashboardTab from './screens/DashboardTab';
import AnalyticsTab from './screens/AnalyticsTab';
import UsersTab from './screens/UsersTab';
import ArticlesTab from './screens/ArticlesTab';
import NotificationsTab from './screens/NotificationsTab';
import SettingsTab from './screens/SettingsTab';
import EditModal from './components/EditModal';
import ListModal from './components/ListModal';

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
  const { user, isAdmin, bootstrapped, logout } = useAuth();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
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

    const [
      usersData,
      keywordsData,
      notificationsData,
      settingsData,
      categoriesData,
      connectionsData,
      analyticsData,
    ] = await Promise.all([
      MockAPI.getUsers(),
      MockAPI.getKeywords(),
      MockAPI.getNotifications(),
      MockAPI.getSettings(),
      MockAPI.getCategories(),
      MockAPI.getConnections(),
      MockAPI.getAnalytics(),
    ]);
    setUsers(usersData);
    setKeywords(keywordsData);
    setNotifications(notificationsData);
    setSettings(settingsData);
    setCategories(categoriesData);
    setConnections(connectionsData);
    setAnalytics(analyticsData);
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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'OpeningScreen' }] });
          } catch {
            Alert.alert('Logout', 'Could not logout. Please try again.');
          }
        },
      },
    ]);
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

  const handleDelete = (id, type) => {
    if (type === 'article') {
      const row = apiArticles.find(a => String(a.id) === String(id));
      if (row?.fromApi) {
        Alert.alert('Read-only', 'Articles come from the database; delete is not exposed here yet.');
        return;
      }
    }
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (type === 'user') await MockAPI.deleteUser(id);
          else if (type === 'article') await MockAPI.deleteArticle(id);
          loadData();
        },
      },
    ]);
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'users') {
        if (editingItem) await MockAPI.updateUser(editingItem.id, formData);
        else await MockAPI.createUser(formData);
      } else if (activeTab === 'articles') {
        if (editingItem) await MockAPI.updateArticle(editingItem.id, formData);
        else await MockAPI.createArticle(formData);
      }
      loadData();
      setModalVisible(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSettingsChange = async (updates) => {
    const updated = await MockAPI.updateSettings(updates);
    setSettings(updated);
  };

  const handleAddCategory = async () => {
    if (categoryInput.trim()) {
      await MockAPI.addCategory(categoryInput);
      setCategoryInput('');
      loadData();
    }
  };

  const handleRemoveCategory = async (id) => {
    await MockAPI.removeCategory(id);
    loadData();
  };

  const handleAddConnection = async () => {
    if (connectionInput.trim()) {
      await MockAPI.addConnection(connectionInput);
      setConnectionInput('');
      loadData();
    }
  };

  const handleRemoveConnection = async (id) => {
    await MockAPI.removeConnection(id);
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

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {activeTab === 'dashboard' && (
          <DashboardTab
            stats={stats}
            keywords={keywords}
            onRunPipeline={runPipeline}
            pipelineRunning={pipelineRunning}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab analytics={analytics} serverAnalytics={serverAnalytics} modelMetrics={modelMetrics} />
        )}
        {activeTab === 'users' && (
          <UsersTab
            users={filteredUsers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'user')}
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