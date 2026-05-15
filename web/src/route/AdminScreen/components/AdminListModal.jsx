import React from 'react';
import { X } from 'lucide-react';
import { useUIFeedback } from '../../../components/ui/UIFeedback';

export default function AdminListModal({
  open,
  onClose,
  title,
  items,
  itemType,
  onDeleteItem,
  onDeleteAll,
  colors,
}) {
  const { confirm } = useUIFeedback();
  if (!open) return null;

  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const borderColor = colors.border;
  const surface = colors.surface;

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '70vh',
          backgroundColor: surface,
          borderRadius: '16px 16px 0 0',
          padding: 20,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: textPrimary }}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleDeleteAll}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Delete all
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
              aria-label="Close"
            >
              <X size={24} color={textPrimary} />
            </button>
          </div>
        </div>
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <p style={{ color: textSecondary, textAlign: 'center', padding: 24 }}>No {itemType}s added yet</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <span style={{ color: textPrimary, fontSize: 15 }}>{item.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    border: 'none',
                    background: '#ef4444',
                    cursor: 'pointer',
                  }}
                  aria-label={`Delete ${item.name}`}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
