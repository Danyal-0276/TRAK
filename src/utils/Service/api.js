import { Platform } from 'react-native';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://127.0.0.1:8000';

let accessToken = null;
let refreshToken = null;
let currentUser = null;

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

export const saveAuthSession = (session) => {
  accessToken = session.access;
  refreshToken = session.refresh;
  currentUser = session.user;
};

export const getCurrentUser = () => currentUser;
export const getAccessToken = () => accessToken;

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
  request('/api/auth/social/demo-login/', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ provider, email }),
  });

export const authRequest = (path, options = {}) =>
  request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
  });

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
