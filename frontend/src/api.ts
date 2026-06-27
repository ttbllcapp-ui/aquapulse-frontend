import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const envBackend = process.env.EXPO_PUBLIC_BACKEND_URL || (Constants.expoConfig?.extra as any)?.backendUrl || '';
export const BACKEND_URL: string = envBackend.replace(/\/$/, '');
export const API_BASE = `${BACKEND_URL}/api`;

const TOKEN_KEY = 'aquapulse_session_token';
const GUEST_ID_KEY = 'aquapulse_guest_id';

async function storeGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem(key) : null; } catch { return null; }
  }
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
}
async function storeSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, value); } catch {}
    return;
  }
  try { await SecureStore.setItemAsync(key, value); } catch {}
}
async function storeDel(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key); } catch {}
    return;
  }
  try { await SecureStore.deleteItemAsync(key); } catch {}
}

export async function getToken(): Promise<string | null> { return storeGet(TOKEN_KEY); }
export async function setToken(t: string): Promise<void> { return storeSet(TOKEN_KEY, t); }
export async function clearToken(): Promise<void> { return storeDel(TOKEN_KEY); }

export async function getOrCreateGuestId(): Promise<string> {
  // Guest id is fine in AsyncStorage (non-sensitive)
  let g = await AsyncStorage.getItem(GUEST_ID_KEY);
  if (!g) {
    g = `g_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    await AsyncStorage.setItem(GUEST_ID_KEY, g);
  }
  return g;
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const tok = await getToken();
  if (tok) headers['Authorization'] = `Bearer ${tok}`;
  else {
    const gid = await getOrCreateGuestId();
    headers['X-Guest-Id'] = gid;
  }
  return headers;
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${txt}`);
  }
  return res.json();
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: await authHeaders() });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${txt}`);
  }
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: await authHeaders() });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${txt}`);
  }
  return res.json();
}
