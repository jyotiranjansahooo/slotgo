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
  verifyOtp,
  type AuthUser,
  type LoginData,
} from "@/services/auth.service";

import { authStorage } from "@/lib/auth-storage";

interface VerifyOtpData {
  email: string;
  otp: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<AuthUser>;
  googleLogin: (credential: string) => Promise<AuthUser>;
  verifyEmailOtp: (data: VerifyOtpData) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

function subscribeHydration(): () => void {
  return () => undefined;
}

function getHydrationSnapshot(): boolean {
  return true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

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

  const login = async (data: LoginData): Promise<AuthUser> => {
    const response = await loginUser(data);

    const loggedInUser = response.data.user;
    const accessToken = response.data.accessToken;

    authStorage.setToken(accessToken);
    authStorage.setUser(loggedInUser);

    notifyAuthChange(loggedInUser);

    return loggedInUser;
  };

  const googleLogin = async (credential: string): Promise<AuthUser> => {
    const response = await googleLoginUser(credential);

    const loggedInUser = response.data.user;
    const accessToken = response.data.accessToken;

    authStorage.setToken(accessToken);
    authStorage.setUser(loggedInUser);

    notifyAuthChange(loggedInUser);

    return loggedInUser;
  };

  const verifyEmailOtp = async (data: VerifyOtpData): Promise<AuthUser> => {
    const response = await verifyOtp(data);

    const verifiedUser = response.data.user;
    const accessToken = response.data.accessToken;

    if (!verifiedUser || !accessToken) {
      throw new Error("Invalid OTP verification response.");
    }

    authStorage.setToken(accessToken);
    authStorage.setUser(verifiedUser);

    notifyAuthChange(verifiedUser);

    return verifiedUser;
  };

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
        verifyEmailOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
