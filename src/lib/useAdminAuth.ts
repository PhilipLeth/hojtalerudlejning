"use client";

import { useCallback, useEffect, useState } from "react";

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";
/** @deprecated — migreres ved login; beholdes som fallback én release */
const LEGACY_KEY = "admin_secret";

export interface AdminUser {
  id: string;
  name: string;
}

export interface LoginUserOption {
  id: string;
  name: string;
}

function readStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

/**
 * Fælles admin-session for alle /admin-sider.
 * `secret` er alias for token — eksisterende fetch-kald bruger ?secret= uændret.
 */
export function useAdminAuth() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loginUsers, setLoginUsers] = useState<LoginUserOption[]>([]);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_KEY) || "";
    setToken(t);
    setUser(readStoredUser());
    setReady(true);

    fetch("/api/admin-login")
      .then((r) => r.json())
      .then((data: { users?: LoginUserOption[] }) => {
        if (Array.isArray(data.users)) setLoginUsers(data.users);
      })
      .catch(() => { /* login-dropdown tom — bruger kan stadig taste id */ });
  }, []);

  const persist = useCallback((newToken: string, newUser: AdminUser | null) => {
    localStorage.removeItem(LEGACY_KEY);
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (newUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (userId: string, password: string): Promise<string | null> => {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Login fejlede";
      persist(data.token, data.user);
      return null;
    },
    [persist],
  );

  const logout = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      try {
        await fetch(`/api/admin-login?secret=${encodeURIComponent(t)}`, { method: "DELETE" });
      } catch { /* ignore */ }
    }
    persist("", null);
  }, [persist]);

  const unauthorized = useCallback(() => {
    persist("", null);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin";
    }
  }, [persist]);

  return {
    token,
    /** Alias — alle eksisterende API-kald bruger `secret` i query */
    secret: token,
    user,
    ready,
    isLoggedIn: !!token,
    loginUsers,
    login,
    logout,
    unauthorized,
  };
}

/** Hent token til upload-komponenter uden hook */
export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_KEY) || "";
}
