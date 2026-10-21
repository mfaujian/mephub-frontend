"use client";

import { createContext, useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import toast from "react-hot-toast";
import { loginRequest, registerRequest, setUnauthorizedHandler } from "@/lib/api-client";
import { isTokenExpired } from "@/lib/jwt";
import { removeKey, STORAGE_KEYS, writeJson } from "@/lib/storage";
import type { AuthSession, AuthUser } from "@/types";

export interface RegisterInput {
  email: string;
  full_name: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  /** false on the server and during the first browser render, true once localStorage has been read */
  isReady: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// The session lives in localStorage so it survives a page refresh. useSyncExternalStore keeps React in sync with it
// (including changes made in another browser tab).
const AUTH_EVENT = "mephub:auth-changed";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_EVENT, callback);
  };
}

function getRawSession(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.auth);
  } catch {
    return null;
  }
}

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Partial<AuthSession>;
    if (!session.token || !session.user || isTokenExpired(session.token)) return null;
    return { token: session.token, user: session.user };
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession): void {
  writeJson(STORAGE_KEYS.auth, session);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function clearSession(): void {
  removeKey(STORAGE_KEYS.auth);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

const subscribeNothing = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const rawSession = useSyncExternalStore(subscribe, getRawSession, () => null);
  const isReady = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const session = useMemo(() => parseSession(rawSession), [rawSession]);

  // An expired or hand-edited session is removed so the rest of the app never sees it.
  useEffect(() => {
    if (isReady && rawSession && !session) clearSession();
  }, [isReady, rawSession, session]);

  // If the API ever answers 401 for a logged-in user, the token is no longer valid: log out and say why.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (getRawSession()) {
        clearSession();
        toast.error("Your session has expired. Please log in again.", { id: "session-expired" });
      }
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email.trim(), password);
    saveSession({ token: response.token, user: response.user });
    return response.user;
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      await registerRequest({ ...input, email: input.email.trim(), full_name: input.full_name.trim() });
      // a successful registration logs the new user in straight away
      return login(input.email, input.password);
    },
    [login],
  );

  const logout = useCallback(() => clearSession(), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isReady,
      isAdmin: session?.user.role === "admin",
      login,
      register,
      logout,
    }),
    [session, isReady, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}