import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { SquarePen, Trash2, X } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { deleteChatConversation } from '../../../utils/Service/api';
import { fetchChatSidebarConversations, LEGACY_CONVERSATION_ID } from '../../../utils/fetchChatSidebarConversations';
import { formatConversationWhen } from '../chatMessageUtils';

const PANEL_WIDTH = Math.min(Dimensions.get('window').width * 0.84, 320);

export default function ChatSidebar({
  visible,
  preload = false,
  onClose,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  topInset = 0,
  refreshKey = 0,
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchChatSidebarConversations();
      setConversations(rows);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible || preload) loadList();
  }, [visible, preload, loadList, refreshKey]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : -PANEL_WIDTH,
        duration: visible ? 240 : 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: visible ? 240 : 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, slideAnim, fadeAnim]);

  const handleDelete = async (id) => {
    if (id === LEGACY_CONVERSATION_ID) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) onNewChat();
      return;
    }
    try {
      await deleteChatConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) onNewChat();
    } catch {
      // ignore
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              width: PANEL_WIDTH,
              paddingTop: topInset,
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Chats</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.iconBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.newChatBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => {
              onNewChat();
              onClose();
            }}
            activeOpacity={0.85}
          >
            <SquarePen size={16} color={colors.textPrimary} />
            <Text style={[styles.newChatText, { color: colors.textPrimary }]}>New chat</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={conversations.length ? styles.listContent : styles.listEmpty}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No past chats yet. Start a conversation and it will appear here.
                </Text>
              }
              renderItem={({ item }) => {
                const active = item.id === activeConversationId;
                return (
                  <View style={[styles.rowWrap, active && { backgroundColor: `${colors.primary}10` }]}>
                    <TouchableOpacity
                      style={styles.row}
                      onPress={() => {
                        onSelectConversation(item.id);
                        onClose();
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.title || 'Chat'}
                      </Text>
                      <Text style={[styles.rowPreview, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.preview || 'No messages'}
                      </Text>
                      <Text style={[styles.rowTime, { color: colors.textTertiary }]}>
                        {formatConversationWhen(item.updated_at || item.created_at)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn} hitSlop={8}>
                      <Trash2 size={15} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 4,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  newChatText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  listEmpty: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  row: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowPreview: {
    fontSize: 13,
    marginBottom: 4,
  },
  rowTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 8,
  },
});
