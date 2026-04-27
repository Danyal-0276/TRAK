const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const ACCESS_KEY = 'trak_access_token';
const REFRESH_KEY = 'trak_refresh_token';
const USER_KEY = 'trak_user';
const storage = typeof window !== 'undefined' ? window.localStorage : null;

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
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) {
    await parseError(res);
  }
  return res.json();
}

function migrateLegacyAuthKeys() {
  if (!storage) return;
  const legacyAccess = storage.getItem('trak_access');
  const legacyRefresh = storage.getItem('trak_refresh');
  if (!storage.getItem(ACCESS_KEY) && legacyAccess) storage.setItem(ACCESS_KEY, legacyAccess);
  if (!storage.getItem(REFRESH_KEY) && legacyRefresh) storage.setItem(REFRESH_KEY, legacyRefresh);
}

migrateLegacyAuthKeys();

export const getAccessToken = () => storage?.getItem(ACCESS_KEY) || null;
export const getRefreshToken = () => storage?.getItem(REFRESH_KEY) || null;

export const getCurrentUser = () => {
  const raw = storage?.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveAuthSession = (session) => {
  storage?.setItem(ACCESS_KEY, session.access);
  storage?.setItem(REFRESH_KEY, session.refresh);
  storage?.setItem(USER_KEY, JSON.stringify(session.user));
};

export const clearAuthTokens = () => {
  storage?.removeItem(ACCESS_KEY);
  storage?.removeItem(REFRESH_KEY);
  storage?.removeItem(USER_KEY);
};

export const loginWithEmailPassword = (email, password) =>
  request('/api/auth/login/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

export const registerWithEmail = (email, password, passwordConfirm, fullName = '', phone = '') =>
  request('/api/auth/register/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      password_confirm: passwordConfirm,
      full_name: fullName,
      phone,
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

export const loginWithSocial = () => Promise.reject(new Error('Demo social login is disabled.'));

export const startSocialOAuth = (provider) => {
  window.location.assign(`${API_BASE_URL}/api/auth/social/${provider}/start/`);
};

export const completeSocialOAuth = (ticket) =>
  request('/api/auth/social/complete/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ ticket }),
  });

export const authRequest = async (path, options = {}) => {
  const doReq = (token) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
      },
    });
  let res = await doReq(getAccessToken());
  if (res.status === 401 && getRefreshToken()) {
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ refresh: getRefreshToken() }),
    });
    if (refreshRes.ok) {
      const payload = await refreshRes.json().catch(() => ({}));
      if (payload.access) {
        storage?.setItem(ACCESS_KEY, payload.access);
        res = await doReq(payload.access);
      }
    }
  }
  if (!res.ok) await parseError(res);
  return res.json();
};

export const getUserFeed = () => authRequest('/api/user/feed/?limit=50');
export const getExploreFeed = () => authRequest('/api/user/explore/?limit=200');
export const chatWithBot = (message) =>
  authRequest('/api/user/chatbot/', {
    method: 'POST',
    body: JSON.stringify({ message }),
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
export const getUserArticleDetail = (articleId) => authRequest(`/api/user/articles/${encodeURIComponent(articleId)}/`);
