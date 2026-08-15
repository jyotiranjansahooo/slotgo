"use client";

import { useAuth } from "@/providers/AuthProvider";

export default function DriverPage() {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="text-3xl font-bold">
        Driver Dashboard
      </h1>

      <p className="mt-4 text-zinc-400">
        Welcome, {user?.firstName}
      </p>

      <button
        type="button"
        onClick={logout}
        className="mt-8 rounded-lg bg-white px-5 py-3 font-medium text-black"
      >
        Logout
      </button>
    </main>
  );
}