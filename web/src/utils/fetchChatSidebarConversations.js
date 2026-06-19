import { getChatHistory, listChatConversations } from './Service/api';

const LEGACY_CONVERSATION_ID = '__legacy__';

function previewFromLegacyMessages(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const text = String(messages[i]?.text || '').trim();
    if (messages[i]?.role === 'user' && text) return text;
  }
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const text = String(messages[i]?.text || '').trim();
    if (text) return text;
  }
  return '';
}

/** Sidebar list: server conversations, with legacy history fallback when needed. */
export async function fetchChatSidebarConversations() {
  try {
    const res = await listChatConversations();
    const conversations = Array.isArray(res?.conversations) ? res.conversations : [];
    if (conversations.length) return conversations;
  } catch {
    // fall through to legacy
  }

  try {
    const hist = await getChatHistory();
    const messages = Array.isArray(hist?.messages) ? hist.messages : [];
    if (!messages.length) return [];
    const preview = previewFromLegacyMessages(messages);
    return [
      {
        id: LEGACY_CONVERSATION_ID,
        title: 'Previous chat',
        preview: preview ? preview.slice(0, 80) : 'Earlier messages',
        updated_at: null,
        legacy: true,
      },
    ];
  } catch {
    return [];
  }
}

export { LEGACY_CONVERSATION_ID };
