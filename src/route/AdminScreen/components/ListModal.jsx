import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useFeedback } from '../../../components/ui/FeedbackProvider';
import { useAdminTheme } from '../useAdminTheme';
import { adminFilledButtonColors } from '../adminTheme';

const ListModal = ({ visible, onClose, title, items, onDeleteItem, onDeleteAll, itemType }) => {
  const { confirm } = useFeedback();
  const { palette } = useAdminTheme();
  const actionBtn = adminFilledButtonColors(palette);

  const handleDeleteItem = async (item) => {
    const accepted = await confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to delete "${item.name}"?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (accepted) onDeleteItem(item.id);
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.listModalContent, { backgroundColor: palette.card }]}>
          <View style={styles.listModalHeader}>
            <Text style={[styles.listModalTitle, { color: palette.textPrimary }]}>{title}</Text>
            <TouchableOpacity
              style={[styles.deleteAllButton, { backgroundColor: actionBtn.background }]}
              onPress={handleDeleteAll}
            >
              <Text style={[styles.deleteAllButtonText, { color: actionBtn.foreground }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listModalClose} onPress={onClose}>
              <X size={24} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.listModalScroll}>
            {items.length === 0 ? (
              <View style={styles.emptyListState}>
                <Text style={[styles.emptyListText, { color: palette.textTertiary }]}>
                  No {itemType}s added yet
                </Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.id} style={[styles.listItem, { borderBottomColor: palette.borderLight }]}>
                  <Text style={[styles.listItemText, { color: palette.textPrimary }]}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.listItemDelete}
                    onPress={() => handleDeleteItem(item)}
                  >
                    <View
                      style={[
                        styles.listItemDot,
                        item.name === 'CNN' ? styles.listItemDotGreen : styles.listItemDotRed,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  listModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    height: '65%',
  },
  listModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  deleteAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  deleteAllButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listModalClose: {
    padding: 4,
  },
  listModalScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemDelete: {
    padding: 8,
  },
  listItemDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4444',
  },
  listItemDotGreen: {
    backgroundColor: '#4CAF50',
  },
  listItemDotRed: {
    backgroundColor: '#ff4444',
  },
  emptyListState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    fontSize: 15,
  },
});

export default ListModal;
