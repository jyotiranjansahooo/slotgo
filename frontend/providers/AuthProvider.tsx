"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  loginUser,
  googleLoginUser,
  type AuthUser,
  type LoginData,
} from "@/services/auth.service";

import { authStorage } from "@/lib/auth-storage";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginData) => Promise<AuthUser>;

  googleLogin: (credential: string) => Promise<AuthUser>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/*
 * ============================================================
 * AUTH STORE
 * ============================================================
 */

let cachedUser: AuthUser | null | undefined;

const listeners = new Set<() => void>();

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = authStorage.getToken();
  const user = authStorage.getUser();

  if (!token || !user) {
    return null;
  }

  return user;
}

function getAuthSnapshot(): AuthUser | null {
  if (cachedUser === undefined) {
    cachedUser = getStoredUser();
  }

  return cachedUser;
}

function getServerAuthSnapshot(): AuthUser | null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notifyAuthChange(user: AuthUser | null): void {
  cachedUser = user;

  listeners.forEach((listener) => {
    listener();
  });
}

/*
 * ============================================================
 * HYDRATION STORE
 * ============================================================
 */

function subscribeHydration(): () => void {
  return () => undefined;
}

function getHydrationSnapshot(): boolean {
  return true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

/*
 * ============================================================
 * PROVIDER
 * ============================================================
 */

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const user = useSyncExternalStore(
    subscribe,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );

  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  /*
   * ============================================================
   * EMAIL / PASSWORD LOGIN
   * ============================================================
   */

  const login = async (data: LoginData): Promise<AuthUser> => {
    const response = await loginUser(data);

    const loggedInUser = response.data.user;
    const accessToken = response.data.accessToken;

    authStorage.setToken(accessToken);
    authStorage.setUser(loggedInUser);

    notifyAuthChange(loggedInUser);

    return loggedInUser;
  };

  /*
   * ============================================================
   * GOOGLE LOGIN
   * ============================================================
   */

  const googleLogin = async (credential: string): Promise<AuthUser> => {
    const response = await googleLoginUser(credential);

    const loggedInUser = response.data.user;
    const accessToken = response.data.accessToken;

    authStorage.setToken(accessToken);
    authStorage.setUser(loggedInUser);

    notifyAuthChange(loggedInUser);

    return loggedInUser;
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const logout = (): void => {
    authStorage.clear();

    notifyAuthChange(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,

        isLoading: !isHydrated,

        isAuthenticated: isHydrated && user !== null,

        login,

        googleLogin,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
 * ============================================================
 * USE AUTH
 * ============================================================
 */

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}