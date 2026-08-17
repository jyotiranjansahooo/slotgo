"use client";

import {
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";

import type {
  UserRole,
} from "@/services/auth.service";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
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

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  const isHydrated =
    useSyncExternalStore(
      subscribeHydration,
      getHydrationSnapshot,
      getServerHydrationSnapshot,
    );

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">
          Checking authentication...
        </p>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    router.replace("/login");

    return null;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    router.replace("/dashboard");

    return null;
  }

  return <>{children}</>;
}