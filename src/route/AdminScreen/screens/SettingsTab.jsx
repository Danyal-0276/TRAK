import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import ToggleSwitch from '../components/ToggleSwitch';
import SettingRow from '../components/SettingRow';

const SettingsTab = ({
  settings,
  onSettingsChange,
  categories,
  connections,
  categoryInput,
  setCategoryInput,
  connectionInput,
  setConnectionInput,
  onAddCategory,
  onRemoveCategory,
  onAddConnection,
  onRemoveConnection,
  onOpenListModal,
}) => {
  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <Text style={styles.sectionTitle}>Settings</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Notification Setting</Text>
        
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

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Language & Region</Text>
        <SettingRow label="Language">
          <View style={styles.settingValueButton}>
            <Text style={styles.settingValueText}>{settings.language}</Text>
          </View>
        </SettingRow>
        <SettingRow label="Timezone">
          <View style={styles.settingValueButton}>
            <Text style={styles.settingValueText}>{settings.timezone}</Text>
          </View>
        </SettingRow>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <Text style={styles.settingsSectionTitle}>Manage Category</Text>
          <TouchableOpacity
            style={styles.listButton}
            onPress={() => onOpenListModal('category')}
          >
            <Text style={styles.listButtonText}>List</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.settingInput}
            placeholder="Enter Category"
            value={categoryInput}
            onChangeText={setCategoryInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addBtn} onPress={onAddCategory}>
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        </View>

        {categories.map((category) => (
          <View key={category.id} style={styles.inputRow}>
            <View style={styles.settingInput}>
              <Text style={styles.inputText}>{category.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemoveCategory(category.id)}
            >
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingsSectionHeader}>
          <Text style={styles.settingsSectionTitle}>Manage Connection</Text>
          <TouchableOpacity
            style={styles.listButton}
            onPress={() => onOpenListModal('connection')}
          >
            <Text style={styles.listButtonText}>List</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.settingInput}
            placeholder="Enter Connection"
            value={connectionInput}
            onChangeText={setConnectionInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addBtn} onPress={onAddConnection}>
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        </View>

        {connections.map((connection) => (
          <View key={connection.id} style={styles.inputRow}>
            <View style={styles.settingInput}>
              <Text style={styles.inputText}>{connection.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemoveConnection(connection.id)}
            >
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?')}
      >
        <Text style={styles.logoutButtonText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  managementSection: {
    paddingHorizontal: 20,
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  settingsSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  listButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  listButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  settingValueButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  settingValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputText: {
    fontSize: 15,
    color: '#000',
  },
  addBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  removeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
});

export default SettingsTab;