"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";

import type { UserRole } from "@/services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  /*
   * ============================================================
   * AUTHENTICATION CHECK
   * ============================================================
   */

  useEffect(() => {
    if (isLoading) {
      return;
    }

    /*
     * User is not authenticated.
     */

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    /*
     * User is authenticated but doesn't have
     * permission for this section.
     */

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    allowedRoles,
    router,
  ]);

  /*
   * ============================================================
   * AUTHENTICATION LOADING
   * ============================================================
   */

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white"
            aria-label="Loading"
          />

          <p className="text-sm text-zinc-400">
            Checking authentication...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * NOT AUTHENTICATED
   * ============================================================
   */

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Authentication required
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * WRONG ROLE
   * ============================================================
   */

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Access denied
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            You don`t have permission to access this page.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * AUTHENTICATED
   * ============================================================
   */

  return <>{children}</>;
}