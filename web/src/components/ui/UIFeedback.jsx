import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

const UIFeedbackContext = createContext(null);

export const UIFeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const notify = ({ type = 'info', message = '' }) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  };

  const confirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) =>
    new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ title, message, confirmText, cancelText, danger });
    });

  const closeDialog = (result) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setDialog(null);
  };

  const api = useMemo(
    () => ({
      notify,
      success: (message) => notify({ type: 'success', message }),
      error: (message) => notify({ type: 'error', message }),
      info: (message) => notify({ type: 'info', message }),
      confirm,
    }),
    []
  );

  return (
    <UIFeedbackContext.Provider value={api}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 3000, display: 'grid', gap: 8 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              minWidth: 220,
              maxWidth: 320,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 10px 28px rgba(15,23,42,0.18)',
              background: t.type === 'error' ? '#FEE2E2' : t.type === 'success' ? '#DCFCE7' : '#E0F2FE',
              borderColor: t.type === 'error' ? '#FCA5A5' : t.type === 'success' ? '#86EFAC' : '#93C5FD',
              color: t.type === 'error' ? '#991B1B' : t.type === 'success' ? '#166534' : '#0C4A6E',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
      {dialog ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3100, background: 'rgba(15,23,42,0.36)', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 340, background: '#fff', border: '1px solid #dbe4f0', borderRadius: 14, padding: 16, boxShadow: '0 20px 45px rgba(15,23,42,0.25)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{dialog.title}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>{dialog.message}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => closeDialog(false)} style={{ border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', padding: '7px 12px', cursor: 'pointer' }}>
                {dialog.cancelText}
              </button>
              <button
                onClick={() => closeDialog(true)}
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 12px',
                  cursor: 'pointer',
                  background: dialog.danger ? '#dc2626' : '#0f172a',
                  color: '#fff',
                }}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </UIFeedbackContext.Provider>
  );
};

export const useUIFeedback = () => {
  const ctx = useContext(UIFeedbackContext);
  if (!ctx) throw new Error('useUIFeedback must be used within UIFeedbackProvider');
  return ctx;
};

