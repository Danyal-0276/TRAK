import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Trash2, X } from 'lucide-react-native';
import Text from '../../../components/ui/Text';
import { useFeedback } from '../../../components/ui/FeedbackProvider';

export default function AdminListPanel({
  open,
  onClose,
  title,
  items,
  itemType,
  onDeleteItem,
  onDeleteAll,
  colors,
}) {
  const { confirm } = useFeedback();

  if (!open) return null;

  const handleDeleteItem = async (item) => {
    const accepted = await confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to delete "${item.name}"?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (accepted) onDeleteItem(item.slug || item.id);
  };

  const handleDeleteAll = async () => {
    const accepted = await confirm({
      title: 'Delete All',
      message: `Are you sure you want to delete all ${itemType}s?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (accepted) onDeleteAll();
  };

  const border = colors.border || '#e5e5e5';
  const panelBg = colors.panelBg || colors.surface || '#fff';
  const textPrimary = colors.textPrimary || '#0a0a0a';
  const textSecondary = colors.textSecondary || '#525252';
  const errorColor = colors.error || '#ef4444';

  return (
    <View style={[styles.wrap, { borderColor: border, backgroundColor: panelBg }]}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Text variant="subtitle" color={textPrimary} style={{ fontWeight: '700', flex: 1 }}>
          {title}
        </Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleDeleteAll} style={[styles.deleteAllBtn, { backgroundColor: errorColor }]}>
            <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>
              Delete all
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.closeBtn}>
          <X size={20} color={textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} nestedScrollEnabled>
        {items.length === 0 ? (
          <Text variant="caption" color={textSecondary} style={styles.empty}>
            No {itemType}s added yet
          </Text>
        ) : (
          items.map((item) => (
            <View key={item.id || item.slug} style={[styles.row, { borderBottomColor: border }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="body" color={textPrimary} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.url ? (
                  <Text variant="caption" color={textSecondary} numberOfLines={1} style={{ marginTop: 2 }}>
                    {item.url}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteItem(item)}
                style={[styles.rowDelete, { backgroundColor: `${errorColor}18` }]}
              >
                <Trash2 size={18} color={errorColor} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 12, marginBottom: 12, maxHeight: 280, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  deleteAllBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  closeBtn: { padding: 4 },
  scroll: { maxHeight: 220 },
  empty: { textAlign: 'center', padding: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowDelete: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
