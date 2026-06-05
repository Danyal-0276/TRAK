import { getCurrentUser } from './Service/api';

export const PROFILE_UPDATED_EVENT = 'trak:profile-updated';

export function profileCacheKey() {
  const u = getCurrentUser();
  const id = u?.id ?? u?.pk;
  return id != null ? `trak_profile_cache_v1_${id}` : 'trak_profile_cache_v1_guest';
}

export function readProfileCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(profileCacheKey());
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeProfileCache(profile) {
  if (typeof window === 'undefined' || !profile) return;
  try {
    window.localStorage.setItem(profileCacheKey(), JSON.stringify(profile));
  } catch {
    // ignore quota errors for large avatars
  }
}

export function dispatchProfileUpdated(profile) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: profile }));
}

export function getProfileAvatar(profile) {
  const avatar = String(profile?.avatar_image || '').trim();
  return avatar || '';
}

export function getProfileInitial(profile, fallbackEmail = '') {
  const base = (profile?.full_name || profile?.email || fallbackEmail || 'U').trim();
  return base.charAt(0).toUpperCase() || 'U';
}
