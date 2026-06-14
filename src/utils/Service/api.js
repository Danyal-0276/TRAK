import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../../config/api';
import { fetchWithTimeout, MOBILE_API_TIMEOUT_MS } from '../../api/fetchWithTimeout';
import { formatNetworkError } from '../networkError';
import { emitAuthSessionEnded } from '../authSessionEvents';

const API_BASE_URL = API_BASE;

const ACCESS_KEY = 'trak_access_token';
const REFRESH_KEY = 'trak_refresh_token';
const USER_KEY = 'trak_user';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const parseError = async (res) => {
  let detail = `Request failed (${res.status})`;
  try {
    const payload = await res.json();
    if (payload?.detail) {
      detail = payload.detail;
    } else if (typeof payload === 'object' && payload !== null) {
      const first = Object.values(payload)[0];
      detail = Array.isArray(first) ? String(first[0]) : String(first);
    }
  } catch (_) {
    // ignore parse issues
  }
  throw new Error(detail);
};

async function request(path, options = {}) {
  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}${path}`, options, MOBILE_API_TIMEOUT_MS);
  } catch (err) {
    throw new Error(formatNetworkError(err));
  }
  if (!res.ok) {
    await parseError(res);
  }
  return res.json();
}

const USER_CONTENT_KEYS = [
  'trak_bookmarks',
  'trak_reactions_v1',
  'trak_user_keywords',
  'trak_profile_cache_v1',
  'trak_profile_bookmarks_cache_v1',
];

export async function clearUserContentCaches() {
  await AsyncStorage.multiRemove(USER_CONTENT_KEYS).catch(() => {});
}

export const saveAuthSession = async (session) => {
  const prev = await getCurrentUser();
  const prevId = prev?.id ?? prev?.pk;
  const nextId = session.user?.id ?? session.user?.pk;
  if (prevId != null && nextId != null && String(prevId) !== String(nextId)) {
    await clearUserContentCaches();
  }
  if (prev == null && nextId != null) {
    await clearUserContentCaches();
  }
  const legacyAccess = await AsyncStorage.getItem('trak_access');
  const legacyRefresh = await AsyncStorage.getItem('trak_refresh');
  const access = session.access || legacyAccess || '';
  const refresh = session.refresh || legacyRefresh || '';
  await AsyncStorage.multiSet([
    [ACCESS_KEY, access],
    [REFRESH_KEY, refresh],
    [USER_KEY, JSON.stringify(session.user || null)],
  ]);
  await AsyncStorage.multiRemove(['trak_access', 'trak_refresh']);
};

export const getCurrentUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
export const getAccessToken = async () =>
  (await AsyncStorage.getItem(ACCESS_KEY)) || (await AsyncStorage.getItem('trak_access'));
export const clearAuthSession = async () => {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, USER_KEY, 'trak_access', 'trak_refresh']);
  await clearUserContentCaches();
};

export const loginWithEmailPassword = (email, password) =>
  request('/api/auth/login/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

export const registerWithEmail = (email, password, passwordConfirm) =>
  request('/api/auth/register/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      password_confirm: passwordConfirm,
    }),
  });

export const requestOtp = (identity) =>
  request('/api/auth/otp/request/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ identity }),
  });

export const loginWithOtp = (identity, code) =>
  request('/api/auth/otp/verify/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ identity, code }),
  });

export const loginWithSocialDemo = (provider, email) =>
  Promise.reject(new Error('Demo social login is disabled.'));

export const loginWithFirebase = (idToken) =>
  request('/api/auth/firebase/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ id_token: idToken }),
  });

export const authRequest = async (path, options = {}) => {
  const access = await getAccessToken();
  if (!access) {
    throw new Error('Please sign in to use this feature.');
  }
  const doReq = (token) =>
    fetchWithTimeout(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      MOBILE_API_TIMEOUT_MS
    );

  let res;
  try {
    res = await doReq(access);
  } catch (err) {
    throw new Error(formatNetworkError(err));
  }
  if (res.status === 401) {
    const refresh = await AsyncStorage.getItem(REFRESH_KEY);
    if (!refresh) {
      await clearAuthSession();
      emitAuthSessionEnded();
      throw new Error('Session expired. Please sign in again.');
    }
    let refreshRes;
    try {
      refreshRes = await fetchWithTimeout(
        `${API_BASE_URL}/api/auth/token/refresh/`,
        {
          method: 'POST',
          headers: jsonHeaders,
          body: JSON.stringify({ refresh }),
        },
        MOBILE_API_TIMEOUT_MS
      );
    } catch (err) {
      throw new Error(formatNetworkError(err));
    }
    if (refreshRes.ok) {
      const payload = await refreshRes.json().catch(() => ({}));
      if (payload.access) {
        await AsyncStorage.setItem(ACCESS_KEY, payload.access);
        try {
          res = await doReq(payload.access);
        } catch (err) {
          throw new Error(formatNetworkError(err));
        }
      } else {
        await clearAuthSession();
        emitAuthSessionEnded();
        throw new Error('Session expired. Please sign in again.');
      }
    } else {
      await clearAuthSession();
      emitAuthSessionEnded();
      throw new Error('Session expired. Please sign in again.');
    }
  }
  if (res.status === 401) {
    await clearAuthSession();
    emitAuthSessionEnded();
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) await parseError(res);
  return res.json();
};

export const getUserFeed = ({ limit = 30, cursor = '', q = '' } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', String(cursor));
  if (q) params.set('q', String(q));
  return authRequest(`/api/user/feed/?${params}`);
};
export const getExploreFeed = ({ limit = 50 } = {}) =>
  authRequest(`/api/user/explore/?limit=${Math.min(Math.max(Number(limit) || 50, 1), 200)}`);

export const getUserBootstrap = ({ limit = 50 } = {}) => {
  const params = new URLSearchParams({
    limit: String(Math.min(Math.max(Number(limit) || 50, 1), 50)),
  });
  return authRequest(`/api/user/bootstrap/?${params}`);
};

export const chatWithBot = (message, conversationId = null) =>
  authRequest('/api/user/chatbot/', {
    method: 'POST',
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    }),
  });

export const listChatConversations = () => authRequest('/api/user/chatbot/conversations/');

export const getChatConversation = (conversationId) =>
  authRequest(`/api/user/chatbot/conversations/${encodeURIComponent(conversationId)}/`);

export const deleteChatConversation = (conversationId) =>
  authRequest(`/api/user/chatbot/conversations/${encodeURIComponent(conversationId)}/`, {
    method: 'DELETE',
  });

export const getChatHistory = () => authRequest('/api/user/chatbot/history/');

export const clearChatHistory = () =>
  authRequest('/api/user/chatbot/history/', {
    method: 'DELETE',
  });

export const getProfile = () => authRequest('/api/auth/profile/');
export const updateProfile = (payload) =>
  authRequest('/api/auth/profile/', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const requestProfileVerification = (payload) =>
  authRequest('/api/auth/verify/request/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const confirmProfileVerification = (payload) =>
  authRequest('/api/auth/verify/confirm/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const followUser = (userId) =>
  authRequest('/api/auth/follow/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
export const unfollowUser = (userId) =>
  authRequest('/api/auth/follow/', {
    method: 'DELETE',
    body: JSON.stringify({ user_id: userId }),
  });
export const setReaction = (articleId, reaction) =>
  authRequest('/api/user/reactions/', {
    method: 'POST',
    body: JSON.stringify({ article_id: articleId, reaction }),
  });
export const listReactions = () => authRequest('/api/user/reactions/');
export const addBookmark = (articleId, title = '', url = '') =>
  authRequest('/api/user/bookmarks/', {
    method: 'POST',
    body: JSON.stringify({ article_id: articleId, title, url }),
  });
export const removeBookmark = (articleId) =>
  authRequest(`/api/user/bookmarks/${encodeURIComponent(articleId)}/`, {
    method: 'DELETE',
  });
export const listBookmarks = () => authRequest('/api/user/bookmarks/');
export const getUserArticleDetail = (articleId) =>
  authRequest(`/api/user/articles/${encodeURIComponent(articleId)}/`);
