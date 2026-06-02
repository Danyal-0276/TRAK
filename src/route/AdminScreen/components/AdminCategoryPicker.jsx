import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import Text from '../../../components/ui/Text';

export default function AdminCategoryPicker({ categories, value, onChange, colors }) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.slug === value);

  const border = colors.border;
  const bg = colors.inputBg || colors.backgroundSecondary;
  const textPrimary = colors.textPrimary;
  const primary = colors.primary;
  const cardBg = colors.card || colors.surface;

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { borderColor: border, backgroundColor: bg }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Text variant="body" color={selected ? textPrimary : colors.textTertiary} style={{ flex: 1 }}>
          {selected ? selected.name : 'Choose a category…'}
        </Text>
        <ChevronDown size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: cardBg, borderColor: border }]}>
            <Text variant="subtitle" color={textPrimary} style={{ fontWeight: '700', marginBottom: 12 }}>
              Select category
            </Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.slug || item.id}
              renderItem={({ item }) => {
                const active = item.slug === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, active && { backgroundColor: `${primary}15` }]}
                    onPress={() => {
                      onChange(item.slug);
                      setOpen(false);
                    }}
                  >
                    <Text variant="body" color={textPrimary} style={{ fontWeight: active ? '700' : '500' }}>
                      {item.name}
                    </Text>
                    {item.subcategories?.length ? (
                      <Text variant="caption" color={colors.textSecondary}>
                        {item.subcategories.length} subcategor{item.subcategories.length === 1 ? 'y' : 'ies'}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    maxHeight: '70%',
  },
  option: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
});
