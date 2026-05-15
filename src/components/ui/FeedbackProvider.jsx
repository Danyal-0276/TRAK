import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const FeedbackContext = createContext(null);

export const FeedbackProvider = ({ children }) => {
  const { theme } = useTheme();
  const colors = theme?.colors || {};
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [actionSheet, setActionSheet] = useState(null);
  const resolverRef = useRef(null);
  const sheetResolverRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2400);
  };

  const confirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) =>
    new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ title, message, confirmText, cancelText, danger });
    });

  const showActionSheet = ({ title, message, actions = [] }) =>
    new Promise((resolve) => {
      sheetResolverRef.current = resolve;
      setActionSheet({ title, message, actions });
    });

  const closeDialog = (value) => {
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
    setDialog(null);
  };

  const closeActionSheet = (value) => {
    if (sheetResolverRef.current) {
      sheetResolverRef.current(value);
      sheetResolverRef.current = null;
    }
    setActionSheet(null);
  };

  const api = useMemo(
    () => ({
      success: (message) => showToast('success', message),
      error: (message) => showToast('error', message),
      info: (message) => showToast('info', message),
      confirm,
      showActionSheet,
    }),
    []
  );

  const toastStyle =
    toast?.type === 'error'
      ? { backgroundColor: colors.errorBg || '#FEE2E2', borderColor: colors.error || '#FCA5A5' }
      : toast?.type === 'success'
      ? { backgroundColor: colors.successBg || '#DCFCE7', borderColor: colors.success || '#86EFAC' }
      : { backgroundColor: colors.surface || '#E0F2FE', borderColor: colors.border || '#93C5FD' };

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      {toast ? (
        <View style={[styles.toastBase, toastStyle]}>
          <Text style={[styles.toastText, { color: colors.textPrimary || '#0f172a' }]}>{toast.message}</Text>
        </View>
      ) : null}
      <Modal transparent visible={Boolean(dialog)} animationType="fade" onRequestClose={() => closeDialog(false)}>
        <View style={styles.overlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.surface || '#fff', borderColor: colors.border || '#dbe4f0' }]}>
            <Text style={[styles.dialogTitle, { color: colors.textPrimary || '#0f172a' }]}>{dialog?.title}</Text>
            <Text style={[styles.dialogMsg, { color: colors.textSecondary || '#64748b' }]}>{dialog?.message}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border || '#cbd5e1' }]}
                onPress={() => closeDialog(false)}
              >
                <Text style={[styles.cancelTxt, { color: colors.textSecondary || '#334155' }]}>{dialog?.cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  dialog?.danger ? { backgroundColor: colors.error || '#dc2626' } : { backgroundColor: colors.primary || '#0f172a' },
                ]}
                onPress={() => closeDialog(true)}
              >
                <Text style={[styles.confirmTxt, { color: colors.textInverse || '#fff' }]}>{dialog?.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal transparent visible={Boolean(actionSheet)} animationType="slide" onRequestClose={() => closeActionSheet(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => closeActionSheet(null)}>
          <Pressable
            style={[styles.sheetCard, { backgroundColor: colors.surface || '#fff', borderColor: colors.border || '#e2e8f0' }]}
            onPress={(e) => e.stopPropagation()}
          >
            {actionSheet?.title ? (
              <Text style={[styles.sheetTitle, { color: colors.textPrimary || '#0f172a' }]} numberOfLines={2}>
                {actionSheet.title}
              </Text>
            ) : null}
            {actionSheet?.message ? (
              <Text style={[styles.sheetMsg, { color: colors.textSecondary || '#64748b' }]}>{actionSheet.message}</Text>
            ) : null}
            {(actionSheet?.actions || []).map((action, idx) => (
              <TouchableOpacity
                key={`${action.label}-${idx}`}
                style={[
                  styles.sheetAction,
                  idx < (actionSheet.actions.length - 1) && { borderBottomWidth: 1, borderBottomColor: colors.borderLight || '#f1f5f9' },
                ]}
                onPress={async () => {
                  closeActionSheet(action.label);
                  try {
                    await action.onPress?.();
                  } catch (_) {
                    /* handled in handler */
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sheetActionText,
                    { color: action.destructive ? colors.error || '#dc2626' : colors.textPrimary || '#0f172a' },
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.sheetCancel, { backgroundColor: colors.backgroundSecondary || '#f1f5f9' }]}
              onPress={() => closeActionSheet(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sheetCancelText, { color: colors.textSecondary || '#64748b' }]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider');
  return ctx;
};

const styles = StyleSheet.create({
  toastBase: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 9999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  toastText: { fontSize: 13, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 20 },
  dialogCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  dialogTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  dialogMsg: { fontSize: 13, marginBottom: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  cancelTxt: { fontSize: 13, fontWeight: '600' },
  confirmBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  confirmTxt: { fontSize: 13, fontWeight: '700' },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheetCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sheetMsg: { fontSize: 13, marginBottom: 12 },
  sheetAction: { paddingVertical: 14 },
  sheetActionText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  sheetCancel: { marginTop: 8, paddingVertical: 14, borderRadius: 12 },
  sheetCancelText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
