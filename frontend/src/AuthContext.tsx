import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as ExpoLinking from 'expo-linking';
import { apiGet, apiPost, getToken, setToken, clearToken, BACKEND_URL, API_BASE } from './api';

export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  signInWithApple: (params: { identityToken: string; fullName?: string }) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number; retries?: number } = {}
): Promise<Response> {
  const { timeoutMs = 30000, retries = 1, ...init } = options;
  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e: any) {
      clearTimeout(timer);
      lastErr = e;
      // If aborted by timeout, retry once (helps with Render cold start)
      if (attempt < retries && (e?.name === 'AbortError' || /Network request failed/i.test(String(e?.message)))) {
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

/**
 * Warm up the backend (Render free tier sleeps after 15 min idle).
 * Called from screens that lead to auth (login, welcome) so by the time
 * the user clicks "Sign in with Apple/Google" the server is awake.
 * Silent — no UI feedback. Fires and forgets.
 */
export async function warmupBackend(): Promise<void> {
  try {
    await fetchWithTimeout(`${BACKEND_URL}/api/health`, { method: 'GET', timeoutMs: 45000, retries: 0 });
  } catch {
    // ignore — best-effort
  }
}

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const tok = await getToken();
    if (!tok) return null;
    const me = await apiGet<AuthUser>('/auth/me');
    return me;
  } catch {
    await clearToken();
    return null;
  }
}

function parseSessionId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Support both ?session_id=... and #session_id=...
  const m = url.match(/[?#&]session_id=([^&#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
  }, []);

  // Process a session_id (from redirect URL) by exchanging for our token
  const processSessionId = useCallback(async (sid: string): Promise<boolean> => {
    try {
      // The Emergent session-data API returns a session_token in `session_token`
      // Our backend handles the exchange so we just call it. But our backend needs the session_id
      // to call Emergent. We pass session_id to backend.
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      });
      if (!res.ok) return false;
      // Backend created the session in DB using the session_token returned by Emergent.
      // We need to also get that token from Emergent on the client to store it.
      // Simpler: call Emergent directly here too to obtain session_token for the client.
      const dataResp = await fetch('https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data', {
        headers: { 'X-Session-ID': sid },
      });
      if (!dataResp.ok) return false;
      const data = await dataResp.json();
      if (!data.session_token) return false;
      await setToken(data.session_token);
      await refresh();
      return true;
    } catch (e) {
      return false;
    }
  }, [refresh]);

  // Initial load
  useEffect(() => {
    (async () => {
      // Web: check URL for session_id first
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const url = window.location.href;
        const sid = parseSessionId(url);
        if (sid) {
          await processSessionId(sid);
          // Clean URL
          try { window.history.replaceState(null, '', window.location.pathname); } catch {}
        }
      } else {
        // Mobile cold start: check initial deep link
        const initial = await Linking.getInitialURL();
        const sid = parseSessionId(initial);
        if (sid) await processSessionId(sid);
      }
      await refresh();
      setLoading(false);
    })();

    // Mobile: hot deep-link listener
    let sub: any = null;
    if (Platform.OS !== 'web') {
      sub = Linking.addEventListener('url', async ({ url }) => {
        const sid = parseSessionId(url);
        if (sid) await processSessionId(sid);
      });
    }
    return () => { if (sub && sub.remove) sub.remove(); };
  }, [processSessionId, refresh]);

  const signInWithGoogle = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const redirectUrl = Platform.OS === 'web'
        ? (typeof window !== 'undefined' ? `${window.location.origin}/` : `${BACKEND_URL}/`)
        : ExpoLinking.createURL('auth');
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = authUrl;
        return { ok: true };
      }

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      if (result.type !== 'success' || !result.url) {
        return { ok: false, error: 'cancelled' };
      }
      const sid = parseSessionId(result.url);
      if (!sid) return { ok: false, error: 'no_session_id' };
      const ok = await processSessionId(sid);
      return ok ? { ok: true } : { ok: false, error: 'verify_failed' };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'unknown' };
    }
  }, [processSessionId]);

  const signOut = useCallback(async () => {
    try { await apiPost('/auth/logout', {}); } catch {}
    await clearToken();
    setUser(null);
  }, []);

  const signInWithApple = useCallback(async ({ identityToken, fullName }: { identityToken: string; fullName?: string }): Promise<{ ok: boolean; error?: string }> => {
    try {
      // 45-second timeout + 1 retry. Render free tier can take 30-60s to wake
      // from a cold start; without timeout the UI hangs indefinitely and
      // App Review rejects (Guideline 2.1(a)).
      const res = await fetchWithTimeout(`${API_BASE}/auth/apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity_token: identityToken, full_name: fullName }),
        timeoutMs: 45000,
        retries: 1,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        return { ok: false, error: `HTTP ${res.status} ${txt}` };
      }
      const data = await res.json();
      if (data?.session_token) {
        await setToken(data.session_token);
      }
      await refresh();
      return { ok: true };
    } catch (e: any) {
      const msg = e?.name === 'AbortError'
        ? 'Sign-in timed out. Please check your connection and try again.'
        : (e?.message || 'unknown');
      return { ok: false, error: msg };
    }
  }, [refresh]);

  return (
    <Ctx.Provider value={{ user, loading, signInWithGoogle, signInWithApple, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
