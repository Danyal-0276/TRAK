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

function titleFromLegacySession(messages) {
  for (const msg of messages) {
    const text = String(msg?.text || '').trim();
    if (msg?.role === 'user' && text) {
      return text.length <= 48 ? text : `${text.slice(0, 47).trimEnd()}…`;
    }
  }
  return 'Chat';
}

export function sessionsFromLegacyMessages(messages) {
  const sessions = [];
  let current = [];
  for (const msg of messages) {
    const role = String(msg?.role || '').toLowerCase();
    if (role === 'user') {
      if (current.length) sessions.push(current);
      current = [msg];
    } else if (current.length) {
      current.push(msg);
    } else if (sessions.length) {
      sessions[sessions.length - 1].push(msg);
    } else {
      current = [msg];
    }
  }
  if (current.length) sessions.push(current);
  return sessions.filter((session) => session.length);
}

export function parseLegacyConversationId(id) {
  if (id === LEGACY_CONVERSATION_ID) return { legacy: true, index: null };
  const prefix = `${LEGACY_CONVERSATION_ID}:`;
  if (String(id).startsWith(prefix)) {
    const index = Number.parseInt(String(id).slice(prefix.length), 10);
    if (!Number.isNaN(index) && index >= 0) return { legacy: true, index };
  }
  return { legacy: false, index: null };
}

function legacyRowsFromMessages(messages) {
  const sessions = sessionsFromLegacyMessages(messages);
  if (!sessions.length) return [];
  return sessions.map((session, index) => {
    const preview = previewFromLegacyMessages(session);
    return {
      id: sessions.length === 1 ? LEGACY_CONVERSATION_ID : `${LEGACY_CONVERSATION_ID}:${index}`,
      title: titleFromLegacySession(session),
      preview: preview ? preview.slice(0, 80) : 'Earlier messages',
      updated_at: null,
      legacy: true,
    };
  });
}

/** Sidebar list from /chatbot/conversations/ (all saved sessions). */
export async function fetchChatSidebarConversations() {
  let conversations = [];
  try {
    const res = await listChatConversations();
    conversations = Array.isArray(res?.conversations) ? res.conversations : [];
    if (conversations.length) return conversations;
  } catch {
    // Conversations API missing or failed (older backend) — fall back to legacy thread.
  }

  try {
    const hist = await getChatHistory();
    const messages = Array.isArray(hist?.messages) ? hist.messages : [];
    return legacyRowsFromMessages(messages);
  } catch {
    return [];
  }
}

export { LEGACY_CONVERSATION_ID };
