import React, { useCallback, useEffect, useState } from 'react';
import { SquarePen, Trash2, X } from 'lucide-react';
import { listChatConversations, deleteChatConversation } from '../../utils/Service/api';
import { formatConversationWhen } from './chatMessageUtils';

export default function ChatSidebar({
  open,
  onClose,
  colors,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listChatConversations();
      setConversations(Array.isArray(res.conversations) ? res.conversations : []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteChatConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) onNewChat();
    } catch {
      // ignore
    }
  };

  return (
    <>
      {open ? (
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 5,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 248,
          zIndex: 6,
          background: colors.surface,
          borderRight: `1px solid ${colors.border}`,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Chats</div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onNewChat();
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: '10px 12px 8px',
            padding: '9px 12px',
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            background: colors.backgroundSecondary,
            color: colors.textPrimary,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <SquarePen size={15} />
          New chat
        </button>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
          {loading ? (
            <div style={{ padding: 16, fontSize: 13, color: colors.textSecondary }}>Loading…</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '16px 14px', fontSize: 13, lineHeight: 1.5, color: colors.textSecondary }}>
              No past chats yet. Start a conversation and it will appear here.
            </div>
          ) : (
            conversations.map((item) => {
              const active = item.id === activeConversationId;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: active ? `${colors.primary}10` : 'transparent',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectConversation(item.id);
                      onClose();
                    }}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      padding: '10px 14px',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title || 'Chat'}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 2,
                      }}
                    >
                      {item.preview || 'No messages'}
                    </div>
                    <div style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>
                      {formatConversationWhen(item.updated_at)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: colors.textTertiary,
                      padding: '8px 10px',
                    }}
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
