"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

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

export interface AdminAuthState {
  token: string;
  secret: string;
  user: AdminUser | null;
  ready: boolean;
  isLoggedIn: boolean;
  loginUsers: LoginUserOption[];
  login: (userId: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  unauthorized: () => void;
}

function readStoredToken(): string {
  const t = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_KEY) || "";
  // Ryd fejlagtigt indhold (fx terminal-advarsel indsat som adgangskode)
  if (t && (t.length > 256 || /[\r\n]/.test(t))) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem(USER_KEY);
    return "";
  }
  return t;
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

const AdminAuthContext = createContext<AdminAuthState | null>(null);

function useProvideAdminAuth(): AdminAuthState {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loginUsers, setLoginUsers] = useState<LoginUserOption[]>([]);

  useEffect(() => {
    const t = readStoredToken();
    setToken(t);
    setUser(readStoredUser());
    setReady(true);

    fetch("/api/admin-login")
      .then((r) => r.json())
      .then((data: { users?: LoginUserOption[] }) => {
        if (Array.isArray(data.users)) setLoginUsers(data.users);
      })
      .catch(() => { /* login-dropdown tom */ });
  }, []);

  const persist = useCallback((newToken: string, newUser: AdminUser | null) => {
    localStorage.removeItem(LEGACY_KEY);
    if (newToken) localStorage.setItem(TOKEN_KEY, newToken);
    else localStorage.removeItem(TOKEN_KEY);
    if (newUser) localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    else localStorage.removeItem(USER_KEY);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(
    async (userId: string, password: string): Promise<string | null> => {
      try {
        const res = await fetch("/api/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, password }),
        });
        let data: { error?: string; token?: string; user?: AdminUser };
        try {
          data = await res.json();
        } catch {
          return res.ok ? "Login fejlede (ugyldigt svar)" : `Login fejlede (${res.status})`;
        }
        if (!res.ok) return data.error || "Forkert bruger eller adgangskode";
        persist(data.token!, data.user ?? null);
        return null;
      } catch {
        return "Netværksfejl — tjek forbindelsen og prøv igen";
      }
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

/** Én shared session for hele /admin — AdminLogin og siderne deler state */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const value = useProvideAdminAuth();
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthState {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth skal bruges inde i <AdminAuthProvider>");
  }
  return ctx;
}

export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return readStoredToken();
}

export async function adminFetch(
  path: string,
  secret: string,
  init?: RequestInit,
): Promise<{ res: Response; data: Record<string, unknown> } | { error: string }> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${path}${sep}secret=${encodeURIComponent(secret)}`;
  try {
    const res = await fetch(url, init);
    let data: Record<string, unknown>;
    try {
      data = await res.json();
    } catch {
      return { error: res.ok ? "Ugyldigt svar fra serveren" : `Serverfejl (${res.status})` };
    }
    return { res, data };
  } catch {
    return { error: "Netværksfejl — tjek forbindelsen og prøv igen" };
  }
}
