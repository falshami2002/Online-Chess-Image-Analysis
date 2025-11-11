import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

type User = { id: string; email: string } | null;
type AuthContextType = {
  user: User;
  isAuthed: boolean;
  loading: boolean;
  refreshSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveGame: (fen: string, title: string) => Promise<any>;
  getGames: () => Promise<any[]>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API = "https://node-backend-8ubs.onrender.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const apiFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    const res = await fetch(`${API}${path}`, {
      credentials: "include",
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    });
    if (res.status === 401 || res.status === 403) {
      setUser(null);
    }
    return res;
  }, []);

  // ensure session is valid / get current user
  const refreshSession = useCallback(async () => {
    try {
      const res = await apiFetch("/me", { method: "GET" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser({ id: data.id, email: data.email });
    } catch {
      setUser(null);
    }
  }, [apiFetch]);

  useEffect(() => {
    (async () => {
      await refreshSession();
      setLoading(false);
    })();
  }, [refreshSession]);

  // register
  const register = async (email: string, password: string) => {
    const res = await apiFetch("/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.text()) || "Registration failed");
    await login(email, password);
  };

  // login
  const login = async (email: string, password: string) => {
    const res = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.text()) || "Login failed");
    await refreshSession();
  };

  // logout
  const logout = async () => {
  const res = await apiFetch("/logout", { method: "POST" }); 
  if (!res.ok) throw new Error((await res.text()) || "Logout failed");
  setUser(null);
};

  // save a game
  const saveGame = async (fen: string, title: string) => {
    const res = await apiFetch("/games", { method: "POST", body: JSON.stringify({ fen, title }) });
    if (!res.ok) throw new Error((await res.text()) || "Failed to save game");
    return res.json();
  };

  // get all games
  const getGames = async () => {
    const res = await apiFetch("/games", { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to load games");
    return res.json();
  };

  const value = useMemo(
    () => ({ user, isAuthed: !!user, loading, refreshSession, login, register, logout, saveGame, getGames }),
    [user, loading, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
