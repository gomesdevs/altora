"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { SESSION_STORAGE_KEY } from "./constants";

type AuthContextValue = {
  accessToken: string | null;
  isReady: boolean;
  setAccessToken: (token: string | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    setAccessTokenState(stored);
    setIsReady(true);
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    if (token) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setAccessTokenState(token);
  }, []);

  const logout = useCallback(async () => {
    setAccessToken(null);
    await fetch("/api/auth/logout", { method: "POST" });
  }, [setAccessToken]);

  const value = useMemo(
    () => ({ accessToken, isReady, setAccessToken, logout }),
    [accessToken, isReady, setAccessToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export async function requireAccessToken(
  getToken: () => string | null,
): Promise<string> {
  const token = getToken();
  if (!token) {
    throw new Error("Sessão expirada — faça login novamente.");
  }
  return token;
}
