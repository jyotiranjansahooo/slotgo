"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  loginUser,
  type AuthUser,
  type LoginData,
} from "@/services/auth.service";

import { authStorage } from "@/lib/auth-storage";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

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

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(
    getStoredUser,
  );

  const login = async (
    data: LoginData,
  ): Promise<AuthUser> => {
    const response = await loginUser(data);

    const loggedInUser = response.data.user;
    const accessToken = response.data.accessToken;

    authStorage.setToken(accessToken);
    authStorage.setUser(loggedInUser);

    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        isAuthenticated: user !== null,
        login,
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
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}