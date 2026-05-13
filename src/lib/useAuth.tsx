"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  batch: string | null;
  role: string;
  expertise: string | null;
  excitedField: string | null;
  aboutLine: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  onboardingComplete: boolean;
  experienceLevel: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

const CACHE_KEY = "tetr_auth_cache";
const CACHE_TTL = 60000; // 1 minute

function getCachedUser(): User | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { user, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  try {
    if (user) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ user, ts: Date.now() }));
    } else {
      sessionStorage.removeItem(CACHE_KEY);
    }
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Try to load from cache immediately — avoids the loading flash
  const [user, setUser] = useState<User | null>(() => getCachedUser());
  const [loading, setLoading] = useState(() => getCachedUser() === null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const u = data.user || null;
      setUser(u);
      setCachedUser(u);
    } catch {
      setUser(null);
      setCachedUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setCachedUser(null);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    // Always refresh from server (but if cached, UI isn't blocked)
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
