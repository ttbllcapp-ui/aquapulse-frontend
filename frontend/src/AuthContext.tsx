import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Linking } from 'react-native';
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
 * the user clicks "Sign in with Apple" the server is awake.
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

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
    <Ctx.Provider value={{ user, loading, signInWithApple, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
