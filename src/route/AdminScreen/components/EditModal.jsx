import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import { adminFilledButtonColors } from '../adminTheme';

const EditModal = ({ visible, onClose, title, formData, onFormChange, fields, onSave }) => {
  const { palette } = useAdminTheme();
  const btn = adminFilledButtonColors(palette);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: palette.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <X size={24} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            {fields.map((field) => (
              <View key={field.name}>
                <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>{field.label}</Text>
                {field.type === 'text' ? (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: palette.inputBg,
                        color: palette.textPrimary,
                        borderColor: palette.border,
                      },
                    ]}
                    value={formData[field.name] || ''}
                    onChangeText={(text) => onFormChange(field.name, text)}
                    placeholder={field.placeholder}
                    placeholderTextColor={palette.textTertiary}
                    keyboardType={field.keyboardType || 'default'}
                  />
                ) : field.type === 'select' ? (
                  <View style={styles.statusSelector}>
                    {field.options.map((option) => {
                      const active = formData[field.name] === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.statusOption,
                            {
                              backgroundColor: active ? palette.textPrimary : palette.inputBg,
                              borderColor: active ? palette.textPrimary : palette.border,
                            },
                          ]}
                          onPress={() => onFormChange(field.name, option)}
                        >
                          <Text
                            style={[
                              styles.statusOptionText,
                              { color: active ? btn.foreground : palette.textSecondary },
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: palette.inputBg }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: palette.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: btn.background }]} onPress={onSave}>
              <Text style={[styles.saveButtonText, { color: btn.foreground }]}>Save</Text>
            </TouchableOpacity>
          </View>
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
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalForm: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditModal;
