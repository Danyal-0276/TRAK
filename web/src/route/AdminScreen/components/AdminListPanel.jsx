import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { useUIFeedback } from '../../../components/ui/UIFeedback';
import './adminSettingsUi.css';

const CLOSE_MS = 280;

/** Inline list panel — stays inside the settings section (no viewport overflow). */
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
  const { confirm } = useUIFeedback();
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    let timer;
    let frame1;
    let frame2;
    if (open) {
      setMounted(true);
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      timer = setTimeout(() => setMounted(false), CLOSE_MS);
    }
    return () => {
      if (frame1) cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const borderColor = colors.border;
  const panelBg = colors.panelBg || colors.card || colors.surface;
  const errorColor = colors.error || '#ef4444';

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

  if (!mounted) return null;

  const wrapClass = [
    'admin-list-panel-wrap',
    visible ? 'admin-list-panel-wrap--open' : 'admin-list-panel-wrap--closing',
  ].join(' ');

  return (
    <div className={wrapClass} role="region" aria-label={title} aria-hidden={!visible}>
      <div className="admin-list-panel-inner">
        <div
          className="admin-list-panel"
          style={{
            border: `1px solid ${borderColor}`,
            backgroundColor: panelBg,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '12px 14px',
              borderBottom: `1px solid ${borderColor}`,
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: textPrimary }}>{title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: errorColor,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.18s ease, transform 0.18s ease',
                  }}
                >
                  Delete all
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.18s ease, opacity 0.18s ease',
                }}
                aria-label="Close list"
              >
                <X size={20} color={textPrimary} />
              </button>
            </div>
          </div>
          <div
            style={{
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
              minHeight: 0,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {items.length === 0 ? (
              <p style={{ color: textSecondary, textAlign: 'center', padding: 20, margin: 0, fontSize: 14 }}>
                No {itemType}s added yet
              </p>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className="admin-list-panel__row"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderBottom: `1px solid ${borderColor}`,
                    animationDelay: `${Math.min(index, 12) * 0.03}s`,
                  }}
                >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: textPrimary,
                    fontSize: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.name}
                >
                  {item.name}
                </div>
                {item.url ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: textSecondary,
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.url}
                  >
                    {item.url}
                  </div>
                ) : null}
                {item.kind && item.kind !== 'rss' ? (
                  <div style={{ fontSize: 11, color: textSecondary, marginTop: 2, textTransform: 'uppercase' }}>
                    {String(item.kind).replace(/_/g, ' ')}
                  </div>
                ) : null}
              </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: 'none',
                      background: `${errorColor}15`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'transform 0.15s ease, background-color 0.15s ease',
                    }}
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 size={18} color={errorColor} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
