import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const AdminScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [
      usersData,
      articlesData,
      keywordsData,
      notificationsData,
      settingsData,
      categoriesData,
      connectionsData,
      analyticsData,
    ] = await Promise.all([
      MockAPI.getUsers(),
      MockAPI.getArticles(),
      MockAPI.getKeywords(),
      MockAPI.getNotifications(),
      MockAPI.getSettings(),
      MockAPI.getCategories(),
      MockAPI.getConnections(),
      MockAPI.getAnalytics(),
    ]);
    setUsers(usersData);
    setArticles(articlesData);
    setKeywords(keywordsData);
    setNotifications(notificationsData);
    setSettings(settingsData);
    setCategories(categoriesData);
    setConnections(connectionsData);
    setAnalytics(analyticsData);
  };

  const stats = [
    { label: 'Total Users', value: users.length.toString() },
    { label: 'Active Users', value: users.filter(u => u.status === 'active').length.toString() },
    { label: 'Articles', value: articles.length.toString() },
    { label: 'Keywords', value: keywords.length.toString() },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setModalVisible(true);
  };

  const handleDelete = (id, type) => {
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

  const filteredArticles = articles.filter(
    a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'dashboard' && <DashboardTab stats={stats} keywords={keywords} />}
        {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
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
          />
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

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
    backgroundColor: '#fff',
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