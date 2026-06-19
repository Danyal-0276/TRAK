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

function legacyFallbackRows(messages) {
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
}

/** Sidebar list from /chatbot/conversations/ (all saved sessions). */
export async function fetchChatSidebarConversations() {
  try {
    const res = await listChatConversations();
    const conversations = Array.isArray(res?.conversations) ? res.conversations : [];
    return conversations;
  } catch {
    // Conversations API missing or failed (older backend) — single legacy row only.
    try {
      const hist = await getChatHistory();
      const messages = Array.isArray(hist?.messages) ? hist.messages : [];
      return legacyFallbackRows(messages);
    } catch {
      return [];
    }
  }
}

export { LEGACY_CONVERSATION_ID };
