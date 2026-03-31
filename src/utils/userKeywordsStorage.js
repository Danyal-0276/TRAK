import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'trak_user_keywords';

function normalize(arr = []) {
  const out = [];
  for (const raw of arr) {
    const s = String(raw || '').trim().toLowerCase();
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

export async function getUserKeywords() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalize(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export async function setUserKeywords(keywords) {
  const cleaned = normalize(keywords);
  await AsyncStorage.setItem(KEY, JSON.stringify(cleaned));
  return cleaned;
}
