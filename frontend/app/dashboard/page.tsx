"use client";

import {
  useEffect,
} from "react";

import { useRouter } from "next/navigation";

import {
  useAuth,
} from "@/providers/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();

  const {
    user,
    isLoading,
  } = useAuth();

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    if (user.role === "driver") {
      router.replace("/driver");
      return;
    }

    if (
      user.role ===
      "parkingOwner"
    ) {
      router.replace("/owner");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin");
    }
  }, [
    user,
    isLoading,
    router,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <p className="text-zinc-400">
        Loading dashboard...
      </p>
    </main>
  );
}