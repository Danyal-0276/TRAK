import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'trak_bookmarks_v1';
const LEGACY_KEY = 'trak_bookmarks';

function normalizeId(id) {
    return String(id);
}

async function readIds(storageKey) {
    try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(normalizeId);
    } catch {
        return [];
    }
}

export async function getBookmarkIds() {
    const current = await readIds(KEY);
    if (current.length) return current;

    const legacy = await readIds(LEGACY_KEY);
    if (legacy.length) {
        await setBookmarkIds(legacy);
        await AsyncStorage.removeItem(LEGACY_KEY).catch(() => {});
    }
    return legacy;
}

export async function setBookmarkIds(ids) {
    const normalized = [...new Set(ids.map(normalizeId))];
    await AsyncStorage.setItem(KEY, JSON.stringify(normalized));
}

export async function toggleBookmarkId(itemId) {
    const key = normalizeId(itemId);
    const ids = await getBookmarkIds();
    const set = new Set(ids);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    const next = Array.from(set);
    await setBookmarkIds(next);
    return new Set(next);
}
