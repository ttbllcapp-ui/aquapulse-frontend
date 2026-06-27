import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, getToken, clearToken, BACKEND_URL } from './api';

export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
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

  return (
    <Ctx.Provider value={{ user, loading, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
