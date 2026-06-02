import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Settings as SettingsIcon, Plus, Trash2, X, Newspaper, Moon, Sun, Image } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import ToggleSwitch from '../components/ToggleSwitch';
import SettingRow from '../components/SettingRow';
import Text from '../../../components/ui/Text';
import { ADMIN_TEXT_STYLE } from '../adminTypography';
import { useFeedback } from '../../../components/ui/FeedbackProvider';
import AdminListPanel from '../components/AdminListPanel';
import AdminCategoryPicker from '../components/AdminCategoryPicker';

const LANGUAGE_OPTIONS = ['English', 'Urdu', 'Arabic', 'French', 'Spanish'];
const TIMEZONE_OPTIONS = ['UTC', 'Asia/Karachi', 'Asia/Dubai', 'Europe/London', 'America/New_York'];

const SettingsTab = ({
  settings,
  onSettingsChange,
  categories,
  connections,
  categoryInput,
  setCategoryInput,
  connectionInput,
  setConnectionInput,
  connectionUrlInput = '',
  setConnectionUrlInput,
  subInputs,
  setSubInputs,
  selectedCategorySlug,
  onSelectedCategorySlugChange,
  selectedCategory,
  listPanel,
  onToggleListPanel,
  onCloseListPanel,
  onAddCategory,
  onRemoveCategory,
  onAddSubcategory,
  onRemoveSubcategory,
  onAddConnection,
  onRemoveConnection,
  onDeleteAllCategories,
  onDeleteAllConnections,
  onLogout,
  onViewNewsApp,
  onViewPicsApp,
  darkTheme,
  onToggleTheme,
}) => {
  const { palette, isDark } = useAdminTheme();
  const { confirm } = useFeedback();

  const actionBg = palette.textPrimary;
  const actionFg = palette.textInverse;
  const actionMutedBg = isDark ? palette.border : palette.textSecondary;
  const listBtnFg = (active) => (active && isDark ? palette.textPrimary : actionFg);

  const listColors = {
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    border: palette.border,
    panelBg: palette.inputBg,
    error: palette.error,
    surface: palette.card,
  };

  const pickerColors = {
    ...listColors,
    inputBg: palette.inputBg,
    card: palette.card,
    primary: palette.textPrimary,
    textTertiary: palette.textTertiary,
  };

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${palette.textPrimary}12` }]}>
            <SettingsIcon size={20} color={palette.textPrimary} />
          </View>
          <Text variant="subtitle" color={palette.textPrimary} style={ADMIN_TEXT_STYLE.sectionTitle}>
            Settings
          </Text>
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text variant="subtitle" color={palette.textPrimary} style={styles.settingsSectionTitle}>
          Notification Setting
        </Text>
        <SettingRow label="Push Notification">
          <ToggleSwitch
            value={settings.pushNotification}
            onValueChange={(value) => onSettingsChange({ pushNotification: value })}
          />
        </SettingRow>
        <SettingRow label="Email Notification">
          <ToggleSwitch
            value={settings.emailNotification}
            onValueChange={(value) => onSettingsChange({ emailNotification: value })}
          />
        </SettingRow>
        <SettingRow label="In-app Notification">
          <ToggleSwitch
            value={settings.inAppNotification}
            onValueChange={(value) => onSettingsChange({ inAppNotification: value })}
          />
        </SettingRow>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text variant="subtitle" color={palette.textPrimary} style={styles.settingsSectionTitle}>
          Language & Region
        </Text>
        <SettingRow label="Language">
          <TouchableOpacity
            style={[styles.settingValueButton, { backgroundColor: actionBg }]}
            onPress={() => {
              Alert.alert('Language', 'Select language', [
                ...LANGUAGE_OPTIONS.map((lang) => ({
                  text: lang,
                  onPress: () => onSettingsChange({ language: lang }),
                })),
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            activeOpacity={0.85}
          >
            <Text variant="caption" color={actionFg} style={styles.settingValueText}>
              {settings.language || 'English'}
            </Text>
          </TouchableOpacity>
        </SettingRow>
        <SettingRow label="Timezone">
          <TouchableOpacity
            style={[styles.settingValueButton, { backgroundColor: actionBg }]}
            onPress={() => {
              Alert.alert('Timezone', 'Select timezone', [
                ...TIMEZONE_OPTIONS.map((tz) => ({
                  text: tz,
                  onPress: () => onSettingsChange({ timezone: tz }),
                })),
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            activeOpacity={0.85}
          >
            <Text variant="caption" color={actionFg} style={styles.settingValueText}>
              {settings.timezone || 'UTC'}
            </Text>
          </TouchableOpacity>
        </SettingRow>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.settingsSectionHeader}>
          <Text variant="subtitle" color={palette.textPrimary} style={[styles.settingsSectionTitle, { marginBottom: 0 }]}>
            Manage Category
          </Text>
          <TouchableOpacity
            style={[
              styles.listButton,
              { backgroundColor: listPanel === 'category' ? actionMutedBg : actionBg },
            ]}
            onPress={() => onToggleListPanel('category')}
            activeOpacity={0.8}
          >
            <Text variant="caption" color={listBtnFg(listPanel === 'category')} style={styles.listButtonText}>
              {listPanel === 'category' ? 'Hide list' : 'List'}
            </Text>
          </TouchableOpacity>
        </View>

        <AdminListPanel
          open={listPanel === 'category'}
          onClose={onCloseListPanel}
          title="All categories"
          items={categories}
          itemType="category"
          onDeleteItem={onRemoveCategory}
          onDeleteAll={onDeleteAllCategories}
          colors={listColors}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.settingInput,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
              },
            ]}
            placeholder="Enter Category"
            value={categoryInput}
            onChangeText={setCategoryInput}
            placeholderTextColor={palette.textTertiary}
            cursorColor={palette.primary}
            onSubmitEditing={onAddCategory}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: actionBg }]}
            onPress={onAddCategory}
            activeOpacity={0.8}
          >
            <Plus size={18} color={actionFg} />
          </TouchableOpacity>
        </View>

        {categories.length > 0 ? (
          <>
            <Text variant="caption" color={palette.textSecondary} style={styles.fieldLabel}>
              Select category
            </Text>
            <AdminCategoryPicker
              categories={categories}
              value={selectedCategorySlug}
              onChange={onSelectedCategorySlugChange}
              colors={pickerColors}
            />

            {selectedCategory ? (
              <View
                style={[
                  styles.subcategoryCard,
                  { borderColor: palette.border, backgroundColor: palette.inputBg },
                ]}
              >
                <View style={styles.subcategoryHeader}>
                  <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '700', flex: 1 }}>
                    {selectedCategory.name}
                  </Text>
                  <TouchableOpacity
                    style={[styles.removeBtn, { backgroundColor: `${palette.error}15` }]}
                    onPress={() => onRemoveCategory(selectedCategory.slug)}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={18} color={palette.error} />
                  </TouchableOpacity>
                </View>

                <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 8 }}>
                  Subcategories
                </Text>
                <View style={styles.chipWrap}>
                  {(selectedCategory.subcategories || []).length ? (
                    selectedCategory.subcategories.map((sub) => (
                      <View
                        key={sub.id || sub.slug}
                        style={[styles.chip, { borderColor: palette.border, backgroundColor: palette.card }]}
                      >
                        <Text variant="caption" color={palette.textPrimary}>
                          {sub.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => onRemoveSubcategory(selectedCategory.slug, sub.slug)}
                          hitSlop={6}
                        >
                          <X size={14} color={palette.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text variant="caption" color={palette.textSecondary}>
                      No subcategories yet.
                    </Text>
                  )}
                </View>

                <View style={[styles.inputRow, { marginBottom: 0 }]}>
                  <TextInput
                    style={[
                      styles.settingInput,
                      {
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                        color: palette.textPrimary,
                        fontSize: 14,
                      },
                    ]}
                    placeholder="Add subcategory"
                    value={subInputs[selectedCategory.slug] || ''}
                    onChangeText={(text) =>
                      setSubInputs((prev) => ({ ...prev, [selectedCategory.slug]: text }))
                    }
                    placeholderTextColor={palette.textTertiary}
                    cursorColor={palette.primary}
                    onSubmitEditing={() => onAddSubcategory(selectedCategory.slug)}
                  />
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: actionBg, width: 44, height: 44, borderRadius: 12 }]}
                    onPress={() => onAddSubcategory(selectedCategory.slug)}
                    activeOpacity={0.8}
                  >
                    <Plus size={16} color={actionFg} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <Text variant="body" color={palette.textSecondary} style={{ marginTop: 4 }}>
            No categories yet. Add one above.
          </Text>
        )}
      </View>

      <View style={[styles.settingsSection, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.settingsSectionHeader}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text variant="subtitle" color={palette.textPrimary} style={[styles.settingsSectionTitle, { marginBottom: 0 }]}>
              Manage Connection
            </Text>
            <Text variant="caption" color={palette.textSecondary} style={{ marginTop: 6, lineHeight: 18 }}>
              News scrape sources (RSS feeds and built-in sites). Used when running the RSS scraper.
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.listButton,
              { backgroundColor: listPanel === 'connection' ? actionMutedBg : actionBg },
            ]}
            onPress={() => onToggleListPanel('connection')}
            activeOpacity={0.8}
          >
            <Text variant="caption" color={listBtnFg(listPanel === 'connection')} style={styles.listButtonText}>
              {listPanel === 'connection' ? 'Hide list' : 'List'}
            </Text>
          </TouchableOpacity>
        </View>

        <AdminListPanel
          open={listPanel === 'connection'}
          onClose={onCloseListPanel}
          title="All connections"
          items={connections}
          itemType="connection"
          onDeleteItem={onRemoveConnection}
          onDeleteAll={onDeleteAllConnections}
          colors={listColors}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.settingInput,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
              },
            ]}
            placeholder="Connection name"
            value={connectionInput}
            onChangeText={setConnectionInput}
            placeholderTextColor={palette.textTertiary}
            cursorColor={palette.primary}
          />
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.settingInput,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.textPrimary,
              },
            ]}
            placeholder="RSS / feed URL (required)"
            value={connectionUrlInput}
            onChangeText={setConnectionUrlInput}
            placeholderTextColor={palette.textTertiary}
            cursorColor={palette.primary}
            autoCapitalize="none"
            onSubmitEditing={onAddConnection}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: actionBg }]}
            onPress={onAddConnection}
            activeOpacity={0.8}
          >
            <Plus size={18} color={actionFg} />
          </TouchableOpacity>
        </View>

        {connections.length === 0 && listPanel !== 'connection' ? (
          <Text variant="body" color={palette.textSecondary} style={{ marginTop: 4 }}>
            No sources yet. Open List or add an RSS feed above.
          </Text>
        ) : null}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text variant="title" color={palette.textPrimary} style={styles.sectionTitle}>
          Appearance & preview
        </Text>
        <TouchableOpacity
          style={[styles.previewBtn, { borderColor: palette.border, backgroundColor: palette.inputBg }]}
          onPress={onToggleTheme}
          activeOpacity={0.8}
        >
          {darkTheme ? <Sun size={18} color={palette.textPrimary} /> : <Moon size={18} color={palette.textPrimary} />}
          <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600', marginLeft: 10 }}>
            {darkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.previewBtn, { borderColor: palette.border, backgroundColor: palette.inputBg, marginTop: 10 }]}
          onPress={onViewNewsApp}
          activeOpacity={0.8}
        >
          <Newspaper size={18} color={palette.textPrimary} />
          <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600', marginLeft: 10 }}>
            View news app
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.previewBtn, { borderColor: palette.border, backgroundColor: palette.inputBg, marginTop: 10 }]}
          onPress={onViewPicsApp}
          activeOpacity={0.8}
        >
          <Image size={18} color={palette.textPrimary} />
          <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600', marginLeft: 10 }}>
            View pics app
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: palette.inputBg, borderColor: palette.border }]}
        onPress={async () => {
          const accepted = await confirm({
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            danger: true,
          });
          if (accepted) onLogout();
        }}
        activeOpacity={0.8}
      >
        <Text variant="body" color={palette.error} style={styles.logoutButtonText}>
          LOGOUT
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  managementSection: { paddingHorizontal: 20, paddingTop: 8 },
  managementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  settingsSectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  listButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  listButtonText: { fontSize: 12, fontWeight: '700' },
  settingValueButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  settingValueText: { fontSize: 13, fontWeight: '600' },
  fieldLabel: { fontWeight: '600', marginBottom: 8, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  settingInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1.5,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  removeBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  subcategoryCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginTop: 12 },
  subcategoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12, minHeight: 32 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, borderWidth: 1.5 },
  logoutButtonText: { fontSize: 15, fontWeight: '700' },
  sectionCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 20 },
  sectionTitle: { fontWeight: '700', marginBottom: 12 },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default SettingsTab;
