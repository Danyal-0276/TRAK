import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FeedbackContext = createContext(null);

export const FeedbackProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2400);
  };

  const confirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) =>
    new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ title, message, confirmText, cancelText, danger });
    });

  const closeDialog = (value) => {
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
    setDialog(null);
  };

  const api = useMemo(
    () => ({
      success: (message) => showToast('success', message),
      error: (message) => showToast('error', message),
      info: (message) => showToast('info', message),
      confirm,
    }),
    []
  );

  const toastStyle =
    toast?.type === 'error'
      ? styles.toastError
      : toast?.type === 'success'
      ? styles.toastSuccess
      : styles.toastInfo;

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      {toast ? (
        <View style={[styles.toastBase, toastStyle]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}
      <Modal transparent visible={Boolean(dialog)} animationType="fade" onRequestClose={() => closeDialog(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>{dialog?.title}</Text>
            <Text style={styles.dialogMsg}>{dialog?.message}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => closeDialog(false)}>
                <Text style={styles.cancelTxt}>{dialog?.cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, dialog?.danger ? styles.confirmDanger : styles.confirmPrimary]}
                onPress={() => closeDialog(true)}
              >
                <Text style={styles.confirmTxt}>{dialog?.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  toastError: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  toastSuccess: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  toastInfo: { backgroundColor: '#E0F2FE', borderColor: '#93C5FD' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.42)', justifyContent: 'center', padding: 20 },
  dialogCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#dbe4f0', padding: 16 },
  dialogTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  dialogMsg: { fontSize: 13, color: '#64748b', marginBottom: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  cancelTxt: { fontSize: 13, fontWeight: '600', color: '#334155' },
  confirmBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  confirmPrimary: { backgroundColor: '#0f172a' },
  confirmDanger: { backgroundColor: '#dc2626' },
  confirmTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
});

